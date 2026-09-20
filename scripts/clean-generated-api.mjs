import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const generatedDirectory = path.resolve("src/api/generated");
const schemaPath = path.join(generatedDirectory, "udhariPayAPI.schemas.ts");
const contractDirectory = path.join(generatedDirectory, "contracts");
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true });
const schemaSource = ts.createSourceFile(schemaPath, fs.readFileSync(schemaPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const endpointPaths = fs.readdirSync(generatedDirectory)
  .filter((name) => name.endsWith(".ts") && name !== path.basename(schemaPath))
  .map((name) => path.join(generatedDirectory, name));

function declaredName(statement) {
  if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) return statement.name.text;
  if (ts.isVariableStatement(statement)) {
    const declaration = statement.declarationList.declarations[0];
    if (declaration && ts.isIdentifier(declaration.name)) return declaration.name.text;
  }
  return undefined;
}

const groups = new Map();
for (const statement of schemaSource.statements) {
  const name = declaredName(statement);
  if (!name) continue;
  const group = groups.get(name) ?? { statements: [], dependencies: new Set(), owners: new Set() };
  group.statements.push(statement);
  groups.set(name, group);
}

for (const [name, group] of groups) {
  for (const statement of group.statements) {
    function visit(node) {
      if (ts.isIdentifier(node) && node.text !== name && groups.has(node.text)) group.dependencies.add(node.text);
      ts.forEachChild(node, visit);
    }
    visit(statement);
  }
}

const endpointImports = new Map();
for (const endpointPath of endpointPaths) {
  const domain = path.basename(endpointPath, ".ts");
  const source = ts.createSourceFile(endpointPath, fs.readFileSync(endpointPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.moduleSpecifier.text.endsWith("udhariPayAPI.schemas")) continue;
    for (const element of statement.importClause?.namedBindings?.elements ?? []) names.add(element.name.text);
  }
  endpointImports.set(domain, names);
  for (const name of names) groups.get(name)?.owners.add(domain);
}

function assignDependencies(name, owner, visited = new Set()) {
  const key = `${owner}:${name}`;
  if (visited.has(key)) return;
  visited.add(key);
  const group = groups.get(name);
  if (!group) return;
  group.owners.add(owner);
  for (const dependency of group.dependencies) assignDependencies(dependency, owner, visited);
}

for (const [domain, names] of endpointImports) {
  for (const name of names) assignDependencies(name, domain);
}

function locationFor(name) {
  const owners = groups.get(name)?.owners ?? new Set();
  return owners.size === 1 ? [...owners][0] : "common";
}

function importDeclaration(names, modulePath) {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([...names].sort().map((name) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name)))),
    ),
    ts.factory.createStringLiteral(modulePath),
  );
}

function printFile(fileName, source, statements) {
  const output = ts.factory.updateSourceFile(source, statements);
  fs.writeFileSync(fileName, `${printer.printFile(output).trim()}\n`);
}

fs.mkdirSync(contractDirectory, { recursive: true });
const locations = new Set([...groups.keys()].map(locationFor));
for (const location of locations) {
  const names = [...groups.keys()].filter((name) => locationFor(name) === location);
  const dependencies = new Set();
  for (const name of names) {
    for (const dependency of groups.get(name).dependencies) {
      if (locationFor(dependency) !== location) dependencies.add(dependency);
    }
  }
  const statements = [];
  if (dependencies.size) statements.push(importDeclaration(dependencies, "../common"));
  for (const statement of schemaSource.statements) {
    const name = declaredName(statement);
    if (name && names.includes(name)) statements.push(statement);
  }
  const outputPath = location === "common" ? path.join(generatedDirectory, "common.ts") : path.join(contractDirectory, `${location}.ts`);
  printFile(outputPath, schemaSource, statements);
}

const endpointTransformer = (context) => {
  const visit = (node) => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      if (node.typeName.text === "BodyType" && node.typeArguments?.[0]) return ts.visitNode(node.typeArguments[0], visit);
      if (node.typeName.text === "SecondParameter") return ts.factory.createTypeReferenceNode("ApiRequestOptions");
    }
    return ts.visitEachChild(node, visit, context);
  };
  return (node) => ts.visitNode(node, visit);
};

for (const endpointPath of endpointPaths) {
  const domain = path.basename(endpointPath, ".ts");
  const source = ts.createSourceFile(endpointPath, fs.readFileSync(endpointPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statements = [];
  const importsByLocation = new Map();
  for (const name of endpointImports.get(domain)) {
    const location = locationFor(name);
    const names = importsByLocation.get(location) ?? new Set();
    names.add(name);
    importsByLocation.set(location, names);
  }
  for (const [location, names] of importsByLocation) {
    const modulePath = location === "common" ? "./common" : `./contracts/${location}`;
    statements.push(importDeclaration(names, modulePath));
  }
  statements.push(ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("apiClient")),
        ts.factory.createImportSpecifier(true, undefined, ts.factory.createIdentifier("ApiRequestOptions")),
      ]),
    ),
    ts.factory.createStringLiteral("../http/client"),
  ));
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (ts.isTypeAliasDeclaration(statement) && (statement.name.text === "SecondParameter" || statement.name.text.endsWith("Result"))) continue;
    const result = ts.transform(statement, [endpointTransformer]);
    statements.push(result.transformed[0]);
    result.dispose();
  }
  printFile(endpointPath, source, statements);
}

fs.rmSync(schemaPath);

const generatedFiles = fs.readdirSync(generatedDirectory, { recursive: true })
  .filter((name) => name.endsWith(".ts"))
  .map((name) => path.join(generatedDirectory, name));
for (const fileName of generatedFiles) {
  const text = fs.readFileSync(fileName, "utf8");
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) throw new Error(`Generated comment found in ${fileName}`);
  }
  if (/\b(?:BodyType|SecondParameter)\b|\b\w+Result\s*=|@tanstack\/react-query|useMutation|useQuery/.test(text)) throw new Error(`Disallowed generated construct found in ${fileName}`);
}
