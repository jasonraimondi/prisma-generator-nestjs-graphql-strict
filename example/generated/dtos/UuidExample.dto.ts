/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////

import { Field, InputType, ID } from "@nestjs/graphql";
import {} from "@prisma/client";
import { PaginatorInputs } from "../paginator";
import { UuidExampleConstructor } from "../models/UuidExample.model";

@InputType()
export class UuidExampleCreateInput implements UuidExampleConstructor {
  @Field(() => ID, { nullable: false })
  id!: string;
}

@InputType()
export class UuidExampleUpdateInput {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@InputType()
export class UuidExampleWhereInput {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@InputType()
export class UuidExamplePaginatorInput extends PaginatorInputs {}
