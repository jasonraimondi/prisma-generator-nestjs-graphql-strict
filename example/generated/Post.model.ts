/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////

import { v4 as uuid } from "uuid";

import { ObjectType, Field, ID } from "@nestjs/graphql";
import { Post as PrismaPost, Category, Tag } from "@prisma/client";
import { User } from "./User.model";

export type PostConstructor = {
  id?: string | null;
  category: (typeof Category)[keyof typeof Category];
  tags?: (typeof Tag)[keyof typeof Tag][] | null;
  body: string;
  userId: string;
  user?: BaseUser | null;
};

@ObjectType()
export class BasePost implements PrismaPost {
  @Field(() => ID, { nullable: false })
  readonly id: string;

  @Field(() => Category!, { nullable: false })
  category: (typeof Category)[keyof typeof Category];

  @Field(() => [Tag!]!, { nullable: false })
  tags: (typeof Tag)[keyof typeof Tag][];

  @Field(() => String!, { nullable: false })
  body: string;

  @Field(() => String!, { nullable: false })
  readonly userId: string;

  @Field(() => BaseUser, { nullable: true })
  user: null | BaseUser;

  constructor(model: PostConstructor) {
    this.id = model.id ?? uuid();
    this.category = model.category;
    this.tags = model.tags ?? [];
    this.body = model.body;
    this.userId = model.userId;
    this.user = model.user ?? null;
  }

  static fromPrisma(data: PrismaPost): BasePost {
    return new BasePost(data);
  }

  // this method removes all relational fields from the entity, and returns the base PrismaModel
  toPrisma(): PrismaPost {
    const { user, ...entity } = this;
    return entity;
  }
}

export { PrismaPost };
