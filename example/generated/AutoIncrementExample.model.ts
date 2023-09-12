/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////

import { ObjectType, Field, ID } from "@nestjs/graphql";
import { AutoIncrementExample as PrismaAutoIncrementExample } from "@prisma/client";

export type AutoIncrementExampleConstructor = {
  id?: number | null;
};

@ObjectType({ isAbstract: true })
export class BaseAutoIncrementExample implements PrismaAutoIncrementExample {
  @Field(() => ID, { nullable: false })
  readonly id: number;

  constructor(model: AutoIncrementExampleConstructor) {
    this.id = model.id!;
  }

  static fromPrisma(data: PrismaAutoIncrementExample): BaseAutoIncrementExample {
    return new BaseAutoIncrementExample(data);
  }

  /**
   * Removes all relational fields from the model
   * so you can use it to create or update a record of this model
   * @returns PrismaAutoIncrementExample
   */
  toPrisma(): PrismaAutoIncrementExample {
    const { ...entity } = this;
    return entity;
  }
}

export { PrismaAutoIncrementExample };
