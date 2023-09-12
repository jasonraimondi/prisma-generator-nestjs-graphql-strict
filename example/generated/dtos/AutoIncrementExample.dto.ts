/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////

import { Field, InputType, ID, Int } from "@nestjs/graphql";
import {} from "@prisma/client";
import { PaginatorInputs } from "../paginator";
import { AutoIncrementExampleConstructor } from "../models/AutoIncrementExample.model";

@InputType()
export class AutoIncrementExampleCreateInput implements AutoIncrementExampleConstructor {
  @Field(() => ID, { nullable: false })
  id!: number;
}

@InputType()
export class AutoIncrementExampleUpdateInput {
  @Field(() => ID, { nullable: true })
  id?: number;
}

@InputType()
export class AutoIncrementExampleWhereInput {
  @Field(() => ID, { nullable: true })
  id?: number;
}

@InputType()
export class AutoIncrementExamplePaginatorInput extends PaginatorInputs {}
