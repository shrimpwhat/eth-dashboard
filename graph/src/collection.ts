import { BigInt } from "@graphprotocol/graph-ts";
import {
  CollectionFactory,
  CollectionCreated,
} from "../generated/CollectionFactory/CollectionFactory";
import { ExampleEntity } from "../generated/schema";

export function handleCollectionCreated(event: CollectionCreated): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from);

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from);
  }

  // Entity fields can be set based on event parameters
  entity.collectionAddress = event.params.collectionAddress;
  entity.creatorAddress = event.params.creatorAddress;

  // Entities can be written to the store with `.save()`
  entity.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.getUserCollections(...)
}
