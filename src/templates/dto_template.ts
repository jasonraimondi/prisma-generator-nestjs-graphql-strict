import { DMMF } from "@prisma/generator-helper";
import {
  graphqlType,
  importRelations,
  importValidations,
  isRequired,
  needsGraphqlJSONImport,
  needsIDField,
  shouldHide,
  type,
  validationBlocks,
} from "./model_template";
import { AUTO_GENERATED_MESSAGE } from "../constants/constants";

type GenerateDtoTemplateArgs = {
  clientPath: string;
  prefix: string;
};

export function generateDtoTemplate(args: GenerateDtoTemplateArgs, model: DMMF.Model) {
  const { clientPath, prefix } = args;

  const createField = (field: DMMF.Field) => {
    const skip = field.isUpdatedAt || field.name === "createdAt";

    if (skip) return "";

    if (field.isId) {
      const required = field.isRequired && !field.hasDefaultValue;
      // @ts-ignore
      return `
          ${validationBlocks(field.documentation)}
          @Field(() => ID, { nullable: ${!required} })  
          ${field.name}${required ? "!" : "?"}: ${type(field, { prefix })}
        `;
    }

    const required = field.name !== "createdAt" && isRequired(field);

    return `
      ${validationBlocks(field.documentation)}
      @Field(() => ${graphqlType(field, { prefix })}, { nullable: ${!required} })  
      ${field.name}${required ? "!" : "?"}: ${type(field, { prefix })}
    `;
  };

  const updateField = (field: DMMF.Field) => {
    if (shouldHide(field.documentation) || field.isUpdatedAt || field.name.startsWith("created")) return "";
    return `
@Field(() => ${
      field.isId
        ? "ID!"
        : graphqlType(field, {
            forceOptional: true,
            prefix,
          })
    }, { nullable: ${!field.isId} })  
${field.name}${field.isId ? "!" : "?"}: ${type(field, { prefix })}
`;
  };

  const whereField = (field: DMMF.Field) => {
    return `
@Field(() => ${
      field.isId
        ? "ID"
        : graphqlType(field, {
            forceOptional: true,
            prefix,
          })
    }, { nullable: true })  
${field.name}?: ${type(field, { prefix })}
`;
  };

  const hasRelatedFields = (f: DMMF.Field) =>
    !model.fields
      .filter(f => f.relationName)
      .map(f => f.name)
      .filter(relation => f.name.startsWith(relation)).length;

  const extraInputs = (model: DMMF.Model) => {
    const inputs: string[] = [];
    model.fields
      .filter(f => !f.isId)
      .filter(f => !f.relationName)
      .filter(f => !f.isUpdatedAt)
      .forEach(f => {
        if (f.type === "Int") inputs.push("Int");
      });
    return [...new Set(inputs)];
  };

  const listEnums = model.fields.filter(f => f.kind == "enum");

  const needsPrismaImport = (model: DMMF.Model) => {
    if (needsGraphqlJSONImport(model)) return true;
    if (listEnums.length > 0) return true;
  };

  return `
    ${AUTO_GENERATED_MESSAGE}

    import { 
      Field, 
      InputType, 
      ${needsIDField(model) ? "ID," : ""} 
      ${extraInputs(model)} 
    } from "@nestjs/graphql";
    ${
      needsPrismaImport(model)
        ? `import {
      ${needsGraphqlJSONImport(model) ? "Prisma," : ""}
      ${listEnums.map(f => f.type)}
    } from "${clientPath}";`
        : ""
    }
    ${importRelations(model, { filterOutRelations: true, prefix })}
    ${importValidations(model)}
    import { ${model.name}Constructor } from "./${model.name}.model";
    import { PaginatorInputs } from "./paginator";
    ${needsGraphqlJSONImport(model) ? `import GraphQLJSON from "graphql-type-json";` : ""}
    
    @InputType()
    export class ${model.name}CreateInput implements ${model.name}Constructor {
    ${model.fields
      .filter(f => !f.relationName)
      .filter(f => !f.isUpdatedAt)
      .map(createField)
      .join("")}
    }
    
    @InputType()
    export class ${model.name}UpdateInput {
    ${model.fields
      .filter(f => !f.relationName)
      .filter(f => !f.isUpdatedAt)
      .filter(hasRelatedFields)
      .map(updateField)
      .join("")}
    }
    
    @InputType()
    export class ${model.name}WhereInput {
    ${model.fields
      .filter(f => !f.relationName)
      .filter(f => !f.isUpdatedAt)
      .filter(f => !f.name.startsWith("created"))
      .filter(f => !shouldHide(f.documentation))
      .map(whereField)
      .join("")}
    }
    
    @InputType()
    export class ${model.name}PaginatorInput extends PaginatorInputs {
    }
`;
}
