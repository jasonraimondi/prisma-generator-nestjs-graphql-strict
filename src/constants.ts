export const GENERATOR_NAME = "prisma-generator-nestjs-graphql";

export const AUTO_GENERATED_MESSAGE = `
/////////////////////////////////////
// THIS FILE WAS AUTO GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
/////////////////////////////////////
`;

export const toPrismaDocBloc = (name: string) => `/**
* Removes all relational fields from the model 
* so you can use it to create or update a record of this model
* @returns Prisma${name}
*/`;

export type ModelOptions = {
  clientPath: string;
  useAbstractModels: boolean;
  compileJs: boolean;
  modelPrefix: string;
  modelSuffix: string;
  modelFileSuffix: string;
};
