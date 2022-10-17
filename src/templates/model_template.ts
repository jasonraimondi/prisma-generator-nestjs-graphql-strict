import { DMMF } from "@prisma/generator-helper";
import { autoGeneratedMessage } from "./dto_template";

export const shouldHide = (documentation?: string) => documentation?.includes("@HideField()") || false;
export const isRequired = (f: DMMF.Field) => (f.isRequired || f.isId) && !f.relationName;
export const isReadOnly = (f: DMMF.Field) => f.isReadOnly || f.isId;
export const needsHideField = (model: DMMF.Model) => model.fields.filter(f => shouldHide(f.documentation)).length > 0;
export const needsIDField = (model: DMMF.Model) => model.fields.filter(f => f.isId).length > 0;
export const needsCuidImport = (model: DMMF.Model) =>
  model.fields.filter((f: any) => f.default?.name === "cuid").length > 0;
export const importCuid = (model: DMMF.Model) => (needsCuidImport(model) ? `import cuid from "cuid";` : "");
export const needsUUIDv4Import = (model: DMMF.Model) =>
  model.fields.filter((f: any) => f.default?.name === "uuid").length > 0;
export const importUUIDv4 = (model: DMMF.Model) => (needsUUIDv4Import(model) ? `import { v4 as uuid } from "uuid";` : "");

export const modelPath = (f: DMMF.Field) => `${f.type}.model`;

export function extraNestjsGraphqlFields(model: DMMF.Model) {
  const inputs: string[] = [];
  model.fields
    .filter(f => !f.isId)
    .filter(f => !f.relationName)
    .filter(f => !f.isUpdatedAt)
    .forEach(f => {
      if (f.type === "Int" && !shouldHide(f.documentation)) inputs.push("Int");
    });
  return [...new Set(inputs)];
}

type TypeArgs = {
  prefix: string;
}

export function type(f: DMMF.Field, { prefix }: TypeArgs) {
  if (f.kind === "object") return `${prefix}${f.type}`;
  if (f.kind === "enum") return `keyof typeof ${f.type}`;
  const map: Record<string, string> = {
    String: "string",
    Int: "number",
    Boolean: "boolean",
    DateTime: "Date",
  };
  return map[f.type] ?? f.type;
}

type GraphqlTypeArgs = {
  forceOptional?: boolean;
  prefix: string;
}

export function graphqlType(f: DMMF.Field, args: GraphqlTypeArgs) {
  const { forceOptional = false, prefix } = args;
  const map: Record<string, string> = {
    DateTime: "Date",
  };
  const result = f.kind === "object" ? `${prefix}${f.type}` : `${map[f.type] ?? f.type}`;
  if (f.isList) return `[${result}${!forceOptional && isRequired(f) ? "!]!" : "]"}`;
  return `${result}${!forceOptional && isRequired(f) ? "!" : ""}`;
}

export function validationBlocks(documentation?: string): string {
  // @see https://regex101.com/r/7Y548N/1
  const matches = documentation?.match(/@Validate.[a-zA-Z]+\([a-zA-Z ,()'"[\]]+/g);
  return (matches ?? [])
    .map(m => m.split("@Validate.")[1])
    .map(m => `@${m}`)
    .join("\n");
}

export function importValidations(model: DMMF.Model) {
  const validations: string[] = [];
  const regex = /@Validate.[a-zA-Z]+/g;
  model.fields
    .map(f => f.documentation?.match(regex) ?? [])
    .forEach(s => s.forEach(t => validations.push(t.replace("@Validate.", ""))));
  const imports = [...new Set(validations)];
  return imports.length ? `import { ${imports} } from "class-validator";` : "";
}

function getDefaultValue(field: DMMF.Field) {
  if (field.hasDefaultValue) {
    // @ts-ignore
    const name: string = field.default.name;
    if (name === "uuid") return "?? uuid()";
    if (name === "cuid") return "?? cuid()";
    if (name === "now") return "?? new Date()";
    if (name === "autoincrement") return "!";

    if (field.default !== undefined) {
      if (field.kind === "enum") return `?? ${field.type}.${field.default}`;
      return `?? ${field.default}`;
    }
  }

  if (!field.isRequired || field.relationName) return "?? null";
  if (field.isList) return "?? []";
  return "";
}

type ImportRelationsArgs = {
  prefix: string;
  filterOutRelations?: boolean;
};

export function importRelations(
  model: DMMF.Model,
  args: ImportRelationsArgs,
): string {
  const { filterOutRelations = false, prefix } = args;
  let fields = model.fields.filter(f => f.kind == "object");
  if (filterOutRelations) fields = fields.filter(f => !f.relationName);
  return fields.map(f => `import { ${type(f, { prefix })} } from "./${modelPath(f)}";`).join("\n");
}

type GraphqlFieldsArgs = {
  prefix: string;
}

function graphqlFields(f: DMMF.Field, { prefix }: GraphqlFieldsArgs) {
  return `@Field(() => ${f.isId ? "ID" : graphqlType(f, { prefix })}, { nullable: ${!isRequired(f)} })`;
}

export const importNestjsGraphql = (model: DMMF.Model) => `
  import {
    ObjectType,
    Field,
    ${needsIDField(model) ? "ID," : ""}
    ${needsHideField(model) ? "HideField," : ""}
    ${extraNestjsGraphqlFields(model)}
  } from "@nestjs/graphql";
`;

type CreateClassFieldArgs = {
  prefix: string;
}

function createClassField(field: DMMF.Field, args: CreateClassFieldArgs) {
  const { prefix } = args;
  // const autoInc = isAutoIncrement(field);
  let result = "";
  if (isReadOnly(field)) result += "readonly ";
  result += field.name;
  if (isRequired(field)) result += ":";
  else result += ": null | ";
  result += type(field, { prefix });
  if (field.isList) result += "[]";

  return result;
}

type ModelOptions = {
  clientPath: string;
  prefix: string;
  abstract: boolean;
}

export const generateModelTemplate = ({ clientPath, prefix, abstract }: ModelOptions, model: DMMF.Model) => `
${autoGeneratedMessage}
${importUUIDv4(model)}
${importCuid(model)}
${importValidations(model)}
${importNestjsGraphql(model)}
import {
  ${model.name} as Prisma${model.name},
  ${model.fields.filter(f => f.kind == "enum").map(f => f.type)}
} from "${clientPath}";
${importRelations(model, { prefix })}

export { Prisma${model.name} };

export type ${model.name}Constructor = {
  ${model.fields
    .map(f => {
      const optional = f.isList || !f.isRequired || f.hasDefaultValue || Boolean(f.relationName);
      let result = f.name;
      // const isAutoIncrement = f.default?.name === "autoincrement";
      // if (f.isId && isAutoIncrement) return `${f.name}: ${type(f)};`;
      if (optional) result += "?";
      result += ": ";
      result += type(f, { prefix });
      if (f.isList) result += "[]";
      if (optional) result += ` | null`;
      return result;
    })
    .join("\n")}
}

@ObjectType(${abstract ? "{ isAbstract: true }" : ""})
export ${abstract ? "abstract " : ""}class ${prefix}${model.name} implements Prisma${model.name} {
  ${model.fields
    .map(
      f => `
    ${validationBlocks(f.documentation)}
    ${shouldHide(f.documentation) ? "@HideField()" : graphqlFields(f, { prefix })}
    ${createClassField(f, { prefix })};
  `,
    )
    .join("\n")}
  
  constructor(model: ${model.name}Constructor) {
     ${model.fields.map(f => `this.${f.name} = model.${f.name}${getDefaultValue(f)};`).join("\n")}
  }
  
  ${abstract ? `
  abstract fromPrisma(hash: Prisma${model.name}): ${prefix}${model.name};
  ` : `
  static fromPrisma(hash: Prisma${model.name}): ${prefix}${model.name} {
    return new ${prefix}${model.name}(hash);
  }
  `}
  
  toPrisma(): Prisma${model.name} {
    const { ${
      model.fields.filter(f => f.relationName).length
        ? model.fields
            .filter(f => f.relationName)
            .map(f => f.name)
            .join(",") + ","
        : ""
    } ...entity } = this;
    return entity;
  }
}
`;
