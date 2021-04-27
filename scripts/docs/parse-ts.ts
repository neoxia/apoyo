import { JSDoc, Node, ObjectLiteralExpression, SourceFile, ts, TypeFormatFlags, VariableStatement } from 'ts-morph'
import { Arr, Option, pipe, Str, throwError, Err } from '../../src'
import { DocElement, parseDoc } from './parse-tsdocs'

const FORMAT_FLAGS =
  TypeFormatFlags.None |
  TypeFormatFlags.NoTruncation |
  TypeFormatFlags.WriteArrayAsGenericType |
  TypeFormatFlags.UseStructuralFallback |
  TypeFormatFlags.WriteTypeArgumentsOfSignature |
  TypeFormatFlags.UseFullyQualifiedType |
  TypeFormatFlags.SuppressAnyReturnType |
  TypeFormatFlags.MultilineObjectLiterals |
  TypeFormatFlags.WriteClassExpressionAsTypeLiteral |
  TypeFormatFlags.UseTypeOfFunction |
  TypeFormatFlags.OmitParameterModifiers |
  TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  TypeFormatFlags.NoTypeReduction |
  TypeFormatFlags.AllowUniqueESSymbolType |
  TypeFormatFlags.AddUndefined |
  TypeFormatFlags.WriteArrowStyleSignature |
  TypeFormatFlags.InArrayType |
  TypeFormatFlags.InElementType |
  TypeFormatFlags.InFirstTypeArgument |
  TypeFormatFlags.InTypeAlias

export const getTypeOf = (node: Node): string =>
  pipe(
    node.getType().getText(node, FORMAT_FLAGS),
    Str.replace(/[{}]/g, ''),
    Str.split(';'),
    Arr.map((str) => str.trim()),
    (arr) => arr.join('\n')
  )

export const getDoc = (jsdocs: JSDoc[]) => {
  return pipe(
    Arr.last(jsdocs),
    Option.map((doc) => doc.getText(true)),
    Option.map(parseDoc)
  )
}

export interface Decl {
  name: string
  type: string
  signature?: string
  docs?: DocElement
  [key: string]: any
}

export const getType = (sourceFile: SourceFile, name: string): Option<Decl> => {
  const typeVar = sourceFile.getTypeAlias(name)
  if (typeVar) {
    return {
      name,
      type: 'type',
      signature: `${typeVar.setIsExported(false).getText(false)}`,
      docs: getDoc(typeVar.getJsDocs())
    }
  }

  const interfaceVar = sourceFile.getInterface(name)
  if (interfaceVar) {
    return {
      name,
      type: 'interface',
      signature: interfaceVar.setIsExported(false).getText(false),
      docs: getDoc(interfaceVar.getJsDocs())
    }
  }

  const enumVar = sourceFile.getEnum(name)
  if (enumVar) {
    return {
      name,
      type: 'enum',
      signature: enumVar.setIsExported(false).getText(false),
      const: enumVar.isConstEnum(),
      docs: getDoc(enumVar.getJsDocs()),
      members: enumVar.getMembers().map((m) => {
        return {
          type: 'member',
          key: m.getName(),
          value: m.getValue()
        }
      })
    }
  }
  return undefined
}

export const getFunction = (sourceFile: SourceFile, name: string): Option<Decl> => {
  const fnDecl = sourceFile.getFunction(name)
  if (fnDecl) {
    return {
      name,
      type: 'function',
      signature: getTypeOf(fnDecl),
      docs: getDoc(fnDecl.getJsDocs())
    }
  }

  const varDecl = sourceFile.getVariableDeclaration(name)
  if (varDecl) {
    const variable = varDecl.getVariableStatementOrThrow()

    if (
      VariableStatement.isArrowFunction(variable) ||
      VariableStatement.isFunctionDeclaration(variable) ||
      VariableStatement.isFunctionExpression(variable)
    ) {
      return {
        name,
        type: 'function',
        typeOf: getTypeOf(varDecl),
        comments: getDoc(variable.getJsDocs())
      }
    }
  }
  return undefined
}

export const getObject = (sourceFile: SourceFile, name: string): Option<Decl> => {
  const varDecl = sourceFile.getVariableDeclaration(name)
  if (varDecl) {
    const variable = varDecl.getVariableStatementOrThrow()
    const object = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)
    if (object) {
      return {
        name,
        type: 'object',
        docs: getDoc(variable.getJsDocs()),
        properties: getObjectProperties(sourceFile, object)
      }
    }
  }
  return undefined
}

export const getObjectOrThrow = (sourceFile: SourceFile, name: string): Decl =>
  pipe(
    getObject(sourceFile, name),
    Option.get(() => throwError(Err.of(`Could not get object {objectName}`, { objectName: name })))
  )

export const getDeclarations = (sourceFile: SourceFile, name: string) => {
  const types: Decl[] = []

  const typeDecl = getType(sourceFile, name)
  if (typeDecl) {
    types.push(typeDecl)
  }

  const fnDecl = getFunction(sourceFile, name)
  if (fnDecl) {
    types.push(fnDecl)
  }

  const objDecl = getObject(sourceFile, name)
  if (objDecl) {
    types.push(objDecl)
  }

  const varDecl = sourceFile.getVariableDeclaration(name)
  if (varDecl) {
    const variable = varDecl.getVariableStatementOrThrow()
    if (!fnDecl && !objDecl) {
      types.push({
        name,
        type: 'variable',
        signature: getTypeOf(varDecl),
        docs: getDoc(variable.getJsDocs())
      })
    }
  }

  return types
}

export const getObjectProperties = (_sourceFile: SourceFile, object: ObjectLiteralExpression) => {
  return object.getProperties().map(
    (prop): Decl => {
      const name = prop.getSymbol()?.getFullyQualifiedName() ?? ''

      const isFunction = prop.getType().getCallSignatures().length > 0
      return {
        type: isFunction ? 'function' : 'unknown',
        name,
        docs: getDoc(prop.getChildrenOfKind(ts.SyntaxKind.JSDocComment)),
        signature: getTypeOf(prop)
      }
    }
  )
}
