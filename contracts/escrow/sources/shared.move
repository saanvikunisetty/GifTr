// creates shared Escrow object, completes trading logic
module escrow::shared { // second party puts up their object for escrow and registers interest in 1st party's object
    use sui::{
        event,
        dynamic_object_field::{Self as dof}
    };

    use escrow::lock::{Locked, Key};

    public struct EscrowedObjectKey has copy, store, drop {}

    public struct Escrow<phantom T: key + store> has key, store { // escrowed object holds its own ID, sender, recipient, ID of key for object they want 
        id: UID,

        sender: address,

        recipient: address,

        exchange_key: ID,
    }

    const EMismatchedSenderRecipient: u64 = 0;

    const EMismatchedExchangeObject: u64 = 1;

    public fun create<T: key + store>(
    // function to create escrow, shared because both ppl need access to swap later
        escrowed: T,
        exchange_key: ID,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let mut escrow = Escrow<T> {
            id: object::new(ctx),
            sender: ctx.sender(),
            recipient,
            exchange_key,
        };
        event::emit(EscrowCreated {
            escrow_id: object::id(&escrow),
            key_id: exchange_key,
            sender: escrow.sender,
            recipient,
            item_id: object::id(&escrowed),
        });

        dof::add(&mut escrow.id, EscrowedObjectKey {}, escrowed);

        transfer::public_share_object(escrow);
    }

    public fun swap<T: key + store, U: key + store>( // completes the trade
        mut escrow: Escrow<T>,
        key: Key,
        locked: Locked<U>,
        ctx: &TxContext,
    ): T {
        let escrowed = dof::remove<EscrowedObjectKey, T>(&mut escrow.id, EscrowedObjectKey {});

        let Escrow {
            id,
            sender,
            recipient,
            exchange_key,
        } = escrow;

        assert!(recipient == ctx.sender(), EMismatchedSenderRecipient); // match sender and recipient
        assert!(exchange_key == object::id(&key), EMismatchedExchangeObject); // match, is it the correct key ID, or was there tampering?

        transfer::public_transfer(locked.unlock(key), sender); // if all good, initiate transfer

        event::emit(EscrowSwapped { // transfer/swap occurs
            escrow_id: id.to_inner(),
        });

        id.delete(); // takes in the escrow but consumes it after swap completes

        escrowed
    }

    public fun return_to_sender<T: key + store>( // sends object back to owner if other party goes radio silent
        mut escrow: Escrow<T>,
        ctx: &TxContext
    ): T {

        event::emit(EscrowCancelled {
            escrow_id: object::id(&escrow)
        });

        let escrowed = dof::remove<EscrowedObjectKey, T>(&mut escrow.id, EscrowedObjectKey {});

        let Escrow {
            id,
            sender,
            recipient: _,
            exchange_key: _,
        } = escrow;

        assert!(sender == ctx.sender(), EMismatchedSenderRecipient);
        id.delete();
        escrowed
    }

    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        key_id: ID,
        sender: address,
        recipient: address,
        item_id: ID,
    }

    public struct EscrowSwapped has copy, drop {
        escrow_id: ID
    }

    public struct EscrowCancelled has copy, drop {
        escrow_id: ID
    }

    #[test_only] use sui::coin::{Self, Coin};
    #[test_only] use sui::sui::SUI;
    #[test_only] use sui::test_scenario::{Self as ts, Scenario};

    #[test_only] use escrow::lock;

    #[test_only] const ALICE: address = @0xA; // constants representing senders
    #[test_only] const BOB: address = @0xB;
    #[test_only] const DIANE: address = @0xD;

    #[test_only]
    fun test_coin(ts: &mut Scenario): Coin<SUI> { // function to mint sui coins
        coin::mint_for_testing<SUI>(42, ts.ctx())
    }
    #[test]
    fun test_successful_swap() {
        let mut ts = ts::begin(@0x0);

        let (i2, ik2) = { // singular transaction storing primitive vals and not whole objects
            ts.next_tx(BOB); // bob has a locked object and key
            let c = test_coin(&mut ts);
            let cid = object::id(&c);
            let (l, k) = lock::lock(c, ts.ctx());
            let kid = object::id(&k);
            transfer::public_transfer(l, BOB);
            transfer::public_transfer(k, BOB);
            (cid, kid)
        };

        let i1 = {
            ts.next_tx(ALICE); // alice sets up escrow and registers interest in bob's coin by referencing his key ID
            let c = test_coin(&mut ts);
            let cid = object::id(&c);
            create(c, ik2, BOB, ts.ctx());
            cid
        };

        {
            ts.next_tx(BOB); // bob will complete the trade by calling swap function
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let k2: Key = ts.take_from_sender();
            let l2: Locked<Coin<SUI>> = ts.take_from_sender();
            let c = escrow.swap(k2, l2, ts.ctx());

            transfer::public_transfer(c, BOB); // the coin returned is sent back to bob
        };
        ts.next_tx(@0x0);

        { // check that alice has bob's coin and bob has alice's
            let c: Coin<SUI> = ts.take_from_address_by_id(ALICE, i2);
            ts::return_to_address(ALICE, c);
        };

        {
            let c: Coin<SUI> = ts.take_from_address_by_id(BOB, i1);
            ts::return_to_address(BOB, c);
        };

        ts::end(ts);
    }

    #[test]
    #[expected_failure(abort_code = EMismatchedSenderRecipient)]
    fun test_mismatch_sender() {
        let mut ts = ts::begin(@0x0);

        let ik2 = {
            ts.next_tx(DIANE);
            let c = test_coin(&mut ts);
            let (l, k) = lock::lock(c, ts.ctx());
            let kid = object::id(&k);
            transfer::public_transfer(l, DIANE);
            transfer::public_transfer(k, DIANE);
            kid
        };

        {
            ts.next_tx(ALICE);
            let c = test_coin(&mut ts);
            create(c, ik2, BOB, ts.ctx());
        };

        {
            ts.next_tx(DIANE);
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let k2: Key = ts.take_from_sender();
            let l2: Locked<Coin<SUI>> = ts.take_from_sender();
            let c = escrow.swap(k2, l2, ts.ctx());

            transfer::public_transfer(c, DIANE);
        };

        abort 1337
    }

    #[test]
    #[expected_failure(abort_code = EMismatchedExchangeObject)]
    fun test_mismatch_object() {
        let mut ts = ts::begin(@0x0);

        {
            ts.next_tx(BOB);
            let c = test_coin(&mut ts);
            let (l, k) = lock::lock(c, ts.ctx());
            transfer::public_transfer(l, BOB);
            transfer::public_transfer(k, BOB);
        };

        {
            ts.next_tx(ALICE);
            let c = test_coin(&mut ts);
            let cid = object::id(&c);
            create(c, cid, BOB, ts.ctx());
        };

        {
            ts.next_tx(BOB);
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let k2: Key = ts.take_from_sender();
            let l2: Locked<Coin<SUI>> = ts.take_from_sender();
            let c = escrow.swap(k2, l2, ts.ctx());

            transfer::public_transfer(c, BOB);
        };

        abort 1337
    }

    #[test]
    #[expected_failure(abort_code = EMismatchedExchangeObject)]
    fun test_object_tamper() {
        let mut ts = ts::begin(@0x0);

        let ik2 = {
            ts.next_tx(BOB);
            let c = test_coin(&mut ts);
            let (l, k) = lock::lock(c, ts.ctx());
            let kid = object::id(&k);
            transfer::public_transfer(l, BOB);
            transfer::public_transfer(k, BOB);
            kid
        };

        {
            ts.next_tx(ALICE);
            let c = test_coin(&mut ts);
            create(c, ik2, BOB, ts.ctx());
        };

        {
            ts.next_tx(BOB);
            let k: Key = ts.take_from_sender();
            let l: Locked<Coin<SUI>> = ts.take_from_sender();
            let mut c = lock::unlock(l, k);

            let _dust = c.split(1, ts.ctx());
            let (l, k) = lock::lock(c, ts.ctx());
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let c = escrow.swap(k, l, ts.ctx());

            transfer::public_transfer(c, BOB);
        };

        abort 1337
    }

    #[test]
    fun test_return_to_sender() {
        let mut ts = ts::begin(@0x0);

        let cid = {
            ts.next_tx(ALICE);
            let c = test_coin(&mut ts);
            let cid = object::id(&c);
            let i = object::id_from_address(@0x0);
            create(c, i, BOB, ts.ctx());
            cid
        };

        {
            ts.next_tx(ALICE);
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let c = escrow.return_to_sender(ts.ctx());

            transfer::public_transfer(c, ALICE);
        };

        ts.next_tx(@0x0);

        {
            let c: Coin<SUI> = ts.take_from_address_by_id(ALICE, cid);
            ts::return_to_address(ALICE, c)
        };

        ts::end(ts);
    }

    #[test]
    #[expected_failure]
    fun test_return_to_sender_failed_swap() {
        let mut ts = ts::begin(@0x0);

        let ik2 = {
            ts.next_tx(BOB);
            let c = test_coin(&mut ts);
            let (l, k) = lock::lock(c, ts.ctx());
            let kid = object::id(&k);
            transfer::public_transfer(l, BOB);
            transfer::public_transfer(k, BOB);
            kid
        };

        {
            ts.next_tx(ALICE);
            let c = test_coin(&mut ts);
            create(c, ik2, BOB, ts.ctx());
        };

        {
            ts.next_tx(ALICE);
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let c = escrow.return_to_sender(ts.ctx());
            transfer::public_transfer(c, ALICE);
        };

        {
            ts.next_tx(BOB);
            let escrow: Escrow<Coin<SUI>> = ts.take_shared();
            let k2: Key = ts.take_from_sender();
            let l2: Locked<Coin<SUI>> = ts.take_from_sender();
            let c = escrow.swap(k2, l2, ts.ctx());

            transfer::public_transfer(c, BOB);
        };

        abort 1337
    }
}