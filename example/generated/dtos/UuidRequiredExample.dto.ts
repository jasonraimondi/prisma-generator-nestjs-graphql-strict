/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////

import { Field, InputType, ID } from "@nestjs/graphql";
import {} from "@prisma/client";
import { PaginatorInputs } from "../paginator";
import { UuidRequiredExampleConstructor } from "../models/UuidRequiredExample.model";

@InputType()
export class UuidRequiredExampleCreateInput implements UuidRequiredExampleConstructor {
  @Field(() => ID, { nullable: false })
  id!: string;
}

@InputType()
export class UuidRequiredExampleUpdateInput {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@InputType()
export class UuidRequiredExampleWhereInput {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@InputType()
export class UuidRequiredExamplePaginatorInput extends PaginatorInputs {}
