import {
    AST, RecursiveAstVisitor, PropertyRead, MethodCall, KeyedRead,
    ImplicitReceiver, LiteralPrimitive, Binary, Chain, Conditional,
    BindingPipe, FunctionCall, Interpolation, KeyedWrite, LiteralArray,
    LiteralMap, PrefixNot, PropertyWrite, SafePropertyRead, SafeMethodCall, Quote
} from '../../angular/compiler/ast';
import * as util from "../../util/lang";

export class JsonStringMapperVisitor extends RecursiveAstVisitor {

    private _handleMethodArgs(args): any {
        if (!args) {
            return ``;
        }

        let result = ``;

        for (let i = 0, length = args.length; i < length; i++) {
            if (i === (length - 1)) {
                result += `${args[i]}`;
            }
            else {
                result += `${args[i]}, `;
            }
        }

        return result;
    }

    private _handlePipeArgs(args): any {
        if (!args) {
            return ``;
        }

        let result = ``;

        for (let arg of args) {
            result += ` : ${arg}`;
        }

        return result;
    }

    visitBinary(ast: Binary): any {
        const left = ast.left.visit(this);
        const right = ast.right.visit(this);

        return `${left} ${ast.operation} ${right}`;
    }

    // TODO
    visitChain(ast: Chain): any {
        return util.compileToJSON(this.visitAll(ast.expressions));
    }

    visitConditional(ast: Conditional): any {
        const condition = ast.condition.visit(this);
        const trueExp = ast.trueExp.visit(this);
        const falseExp = ast.falseExp.visit(this);

        return `${condition} ? ${trueExp} : ${falseExp}`;
    }

    visitPipe(ast: BindingPipe): any {
        const pipe = ast.name;
        const value = ast.exp.visit(this);
        const args = this._handlePipeArgs(this.visitAll(ast.args));

        return `${value} | ${pipe}${args}`;
    }

    // TODO
    visitFunctionCall(ast: FunctionCall): any {
        const target = ast.target.visit(this);
        const args = this._handleMethodArgs(this.visitAll(ast.args));

        return `${target}(${args})`;
    }

    visitImplicitReceiver(ast: ImplicitReceiver): any {
        return ``;
    }

    visitInterpolation(ast: Interpolation): any {
        return `{{${this.visitAll(ast.expressions)[0]}}}`;
    }

    visitKeyedRead(ast: KeyedRead): any {
        const obj = ast.obj.visit(this);
        let key = ast.key.visit(this);

        return `${obj}[${key}]`;
    }

    visitKeyedWrite(ast: KeyedWrite): any {
        return null;
    }

    visitLiteralArray(ast: LiteralArray): any {
        return util.compileToJSON(this.visitAll(ast.expressions));
    }

    visitLiteralMap(ast: LiteralMap, firstCall: boolean): any {
        const result = {};
        const keys = ast.keys;
        const values = this.visitAll(ast.values);

        for (let i = 0, length = keys.length; i < length; i++) {
            let value = values[i];

            if (typeof value !== 'string' && firstCall) {
                value = `${value}`;
            }

            result[keys[i]] = value;
        }

        if (firstCall) {
            return result;
        }

        return util.compileToJSON(result);
    }

    visitLiteralPrimitive(ast: LiteralPrimitive): any {
        return typeof ast.value === 'string' ? `'${ast.value}'` : ast.value;
    }

    visitMethodCall(ast: MethodCall): any {
        const methodName = ast.name;
        const receiver = ast.receiver.visit(this);
        const args = this._handleMethodArgs(this.visitAll(ast.args));

        return `${receiver ? receiver + '.' : receiver}${methodName}(${args})`;
    }

    visitPrefixNot(ast: PrefixNot): any {
        return ast.expression.visit(this);
    }

    visitPropertyRead(ast: PropertyRead): any {
        const property = ast.name;
        const receiver = ast.receiver.visit(this);

        return `${receiver ? receiver + '.' : receiver}${property}`;
    }

    visitPropertyWrite(ast: PropertyWrite): any {
        return null;
    }

    visitSafePropertyRead(ast: SafePropertyRead): any {
        const property = ast.name;
        const receiver = ast.receiver.visit(this);

        return `${receiver ? receiver + '.' : receiver}${property}`;
    }

    visitSafeMethodCall(ast: SafeMethodCall): any {
        const methodName = ast.name;
        const receiver = ast.receiver.visit(this);
        const args = this._handleMethodArgs(this.visitAll(ast.args));

        return `${receiver ? receiver + '.' : receiver}${methodName}(${args})`;
    }

    visitAll(asts: AST[]): any {
        return asts.map(ast => ast.visit(this));
    }

    visitQuote(ast: Quote): any {
        return null;
    }
}