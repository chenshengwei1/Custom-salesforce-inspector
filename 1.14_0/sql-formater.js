!function(E, T) {
    "object" == typeof exports && "object" == typeof module ? module.exports = T() : "function" == typeof define && define.amd ? define([], T) : "object" == typeof exports ? exports.sqlFormatter = T() : E.sqlFormatter = T()
}(this, (()=>(()=>{
    var E = {
        654: function(E) {
            var T;
            T = function() {
                function E(T, R, A) {
                    return this.id = ++E.highestId,
                    this.name = T,
                    this.symbols = R,
                    this.postprocess = A,
                    this
                }
                function T(E, T, R, A) {
                    this.rule = E,
                    this.dot = T,
                    this.reference = R,
                    this.data = [],
                    this.wantedBy = A,
                    this.isComplete = this.dot === E.symbols.length
                }
                function R(E, T) {
                    this.grammar = E,
                    this.index = T,
                    this.states = [],
                    this.wants = {},
                    this.scannable = [],
                    this.completed = {}
                }
                function A(E, T) {
                    this.rules = E,
                    this.start = T || this.rules[0].name;
                    var R = this.byName = {};
                    this.rules.forEach((function(E) {
                        R.hasOwnProperty(E.name) || (R[E.name] = []),
                        R[E.name].push(E)
                    }
                    ))
                }
                function S() {
                    this.reset("")
                }
                function N(E, T, N) {
                    if (E instanceof A) {
                        var O = E;
                        N = T
                    } else
                        O = A.fromCompiled(E, T);
                    for (var I in this.grammar = O,
                    this.options = {
                        keepHistory: !1,
                        lexer: O.lexer || new S
                    },
                    N || {})
                        this.options[I] = N[I];
                    this.lexer = this.options.lexer,
                    this.lexerState = void 0;
                    var L = new R(O,0);
                    this.table = [L],
                    L.wants[O.start] = [],
                    L.predict(O.start),
                    L.process(),
                    this.current = 0
                }
                function O(E) {
                    var T = typeof E;
                    if ("string" === T)
                        return E;
                    if ("object" === T) {
                        if (E.literal)
                            return JSON.stringify(E.literal);
                        if (E instanceof RegExp)
                            return E.toString();
                        if (E.type)
                            return "%" + E.type;
                        if (E.test)
                            return "<" + String(E.test) + ">";
                        throw new Error("Unknown symbol type: " + E)
                    }
                }
                return E.highestId = 0,
                E.prototype.toString = function(E) {
                    var T = void 0 === E ? this.symbols.map(O).join(" ") : this.symbols.slice(0, E).map(O).join(" ") + " ● " + this.symbols.slice(E).map(O).join(" ");
                    return this.name + " → " + T
                }
                ,
                T.prototype.toString = function() {
                    return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0)
                }
                ,
                T.prototype.nextState = function(E) {
                    var R = new T(this.rule,this.dot + 1,this.reference,this.wantedBy);
                    return R.left = this,
                    R.right = E,
                    R.isComplete && (R.data = R.build(),
                    R.right = void 0),
                    R
                }
                ,
                T.prototype.build = function() {
                    var E = []
                      , T = this;
                    do {
                        E.push(T.right.data),
                        T = T.left
                    } while (T.left);
                    return E.reverse(),
                    E
                }
                ,
                T.prototype.finish = function() {
                    this.rule.postprocess && (this.data = this.rule.postprocess(this.data, this.reference, N.fail))
                }
                ,
                R.prototype.process = function(E) {
                    for (var T = this.states, R = this.wants, A = this.completed, S = 0; S < T.length; S++) {
                        var O = T[S];
                        if (O.isComplete) {
                            if (O.finish(),
                            O.data !== N.fail) {
                                for (var I = O.wantedBy, L = I.length; L--; ) {
                                    var C = I[L];
                                    this.complete(C, O)
                                }
                                if (O.reference === this.index) {
                                    var _ = O.rule.name;
                                    (this.completed[_] = this.completed[_] || []).push(O)
                                }
                            }
                        } else {
                            if ("string" != typeof (_ = O.rule.symbols[O.dot])) {
                                this.scannable.push(O);
                                continue
                            }
                            if (R[_]) {
                                if (R[_].push(O),
                                A.hasOwnProperty(_)) {
                                    var e = A[_];
                                    for (L = 0; L < e.length; L++) {
                                        var P = e[L];
                                        this.complete(O, P)
                                    }
                                }
                            } else
                                R[_] = [O],
                                this.predict(_)
                        }
                    }
                }
                ,
                R.prototype.predict = function(E) {
                    for (var R = this.grammar.byName[E] || [], A = 0; A < R.length; A++) {
                        var S = R[A]
                          , N = this.wants[E]
                          , O = new T(S,0,this.index,N);
                        this.states.push(O)
                    }
                }
                ,
                R.prototype.complete = function(E, T) {
                    var R = E.nextState(T);
                    this.states.push(R)
                }
                ,
                A.fromCompiled = function(T, R) {
                    var S = T.Lexer;
                    T.ParserStart && (R = T.ParserStart,
                    T = T.ParserRules);
                    var N = new A(T = T.map((function(T) {
                        return new E(T.name,T.symbols,T.postprocess)
                    }
                    )),R);
                    return N.lexer = S,
                    N
                }
                ,
                S.prototype.reset = function(E, T) {
                    this.buffer = E,
                    this.index = 0,
                    this.line = T ? T.line : 1,
                    this.lastLineBreak = T ? -T.col : 0
                }
                ,
                S.prototype.next = function() {
                    if (this.index < this.buffer.length) {
                        var E = this.buffer[this.index++];
                        return "\n" === E && (this.line += 1,
                        this.lastLineBreak = this.index),
                        {
                            value: E
                        }
                    }
                }
                ,
                S.prototype.save = function() {
                    return {
                        line: this.line,
                        col: this.index - this.lastLineBreak
                    }
                }
                ,
                S.prototype.formatError = function(E, T) {
                    var R = this.buffer;
                    if ("string" == typeof R) {
                        var A = R.split("\n").slice(Math.max(0, this.line - 5), this.line)
                          , S = R.indexOf("\n", this.index);
                        -1 === S && (S = R.length);
                        var N = this.index - this.lastLineBreak
                          , O = String(this.line).length;
                        return T += " at line " + this.line + " col " + N + ":\n\n",
                        (T += A.map((function(E, T) {
                            return I(this.line - A.length + T + 1, O) + " " + E
                        }
                        ), this).join("\n")) + "\n" + I("", O + N) + "^\n"
                    }
                    return T + " at index " + (this.index - 1);
                    function I(E, T) {
                        var R = String(E);
                        return Array(T - R.length + 1).join(" ") + R
                    }
                }
                ,
                N.fail = {},
                N.prototype.feed = function(E) {
                    var T, A = this.lexer;
                    for (A.reset(E, this.lexerState); ; ) {
                        try {
                            if (!(T = A.next()))
                                break
                        } catch (E) {
                            var N = new R(this.grammar,this.current + 1);
                            throw this.table.push(N),
                            (L = new Error(this.reportLexerError(E))).offset = this.current,
                            L.token = E.token,
                            L
                        }
                        var O = this.table[this.current];
                        this.options.keepHistory || delete this.table[this.current - 1];
                        var I = this.current + 1;
                        N = new R(this.grammar,I),
                        this.table.push(N);
                        for (var L, C = void 0 !== T.text ? T.text : T.value, _ = A.constructor === S ? T.value : T, e = O.scannable, P = e.length; P--; ) {
                            var D = e[P]
                              , s = D.rule.symbols[D.dot];
                            if (s.test ? s.test(_) : s.type ? s.type === T.type : s.literal === C) {
                                var M = D.nextState({
                                    data: _,
                                    token: T,
                                    isToken: !0,
                                    reference: I - 1
                                });
                                N.states.push(M)
                            }
                        }
                        if (N.process(),
                        0 === N.states.length)
                            throw (L = new Error(this.reportError(T))).offset = this.current,
                            L.token = T,
                            L;
                        this.options.keepHistory && (O.lexerState = A.save()),
                        this.current++
                    }
                    return O && (this.lexerState = A.save()),
                    this.results = this.finish(),
                    this
                }
                ,
                N.prototype.reportLexerError = function(E) {
                    var T, R, A = E.token;
                    return A ? (T = "input " + JSON.stringify(A.text[0]) + " (lexer error)",
                    R = this.lexer.formatError(A, "Syntax error")) : (T = "input (lexer error)",
                    R = E.message),
                    this.reportErrorCommon(R, T)
                }
                ,
                N.prototype.reportError = function(E) {
                    var T = (E.type ? E.type + " token: " : "") + JSON.stringify(void 0 !== E.value ? E.value : E)
                      , R = this.lexer.formatError(E, "Syntax error");
                    return this.reportErrorCommon(R, T)
                }
                ,
                N.prototype.reportErrorCommon = function(E, T) {
                    var R = [];
                    R.push(E);
                    var A = this.table.length - 2
                      , S = this.table[A]
                      , N = S.states.filter((function(E) {
                        var T = E.rule.symbols[E.dot];
                        return T && "string" != typeof T
                    }
                    ));
                    return 0 === N.length ? (R.push("Unexpected " + T + ". I did not expect any more input. Here is the state of my parse table:\n"),
                    this.displayStateStack(S.states, R)) : (R.push("Unexpected " + T + ". Instead, I was expecting to see one of the following:\n"),
                    N.map((function(E) {
                        return this.buildFirstStateStack(E, []) || [E]
                    }
                    ), this).forEach((function(E) {
                        var T = E[0]
                          , A = T.rule.symbols[T.dot]
                          , S = this.getSymbolDisplay(A);
                        R.push("A " + S + " based on:"),
                        this.displayStateStack(E, R)
                    }
                    ), this)),
                    R.push(""),
                    R.join("\n")
                }
                ,
                N.prototype.displayStateStack = function(E, T) {
                    for (var R, A = 0, S = 0; S < E.length; S++) {
                        var N = E[S]
                          , O = N.rule.toString(N.dot);
                        O === R ? A++ : (A > 0 && T.push("    ^ " + A + " more lines identical to this"),
                        A = 0,
                        T.push("    " + O)),
                        R = O
                    }
                }
                ,
                N.prototype.getSymbolDisplay = function(E) {
                    return function(E) {
                        var T = typeof E;
                        if ("string" === T)
                            return E;
                        if ("object" === T) {
                            if (E.literal)
                                return JSON.stringify(E.literal);
                            if (E instanceof RegExp)
                                return "character matching " + E;
                            if (E.type)
                                return E.type + " token";
                            if (E.test)
                                return "token matching " + String(E.test);
                            throw new Error("Unknown symbol type: " + E)
                        }
                    }(E)
                }
                ,
                N.prototype.buildFirstStateStack = function(E, T) {
                    if (-1 !== T.indexOf(E))
                        return null;
                    if (0 === E.wantedBy.length)
                        return [E];
                    var R = E.wantedBy[0]
                      , A = [E].concat(T)
                      , S = this.buildFirstStateStack(R, A);
                    return null === S ? null : [E].concat(S)
                }
                ,
                N.prototype.save = function() {
                    var E = this.table[this.current];
                    return E.lexerState = this.lexerState,
                    E
                }
                ,
                N.prototype.restore = function(E) {
                    var T = E.index;
                    this.current = T,
                    this.table[T] = E,
                    this.table.splice(T + 1),
                    this.lexerState = E.lexerState,
                    this.results = this.finish()
                }
                ,
                N.prototype.rewind = function(E) {
                    if (!this.options.keepHistory)
                        throw new Error("set option `keepHistory` to enable rewinding");
                    this.restore(this.table[E])
                }
                ,
                N.prototype.finish = function() {
                    var E = []
                      , T = this.grammar.start;
                    return this.table[this.table.length - 1].states.forEach((function(R) {
                        R.rule.name === T && R.dot === R.rule.symbols.length && 0 === R.reference && R.data !== N.fail && E.push(R)
                    }
                    )),
                    E.map((function(E) {
                        return E.data
                    }
                    ))
                }
                ,
                {
                    Parser: N,
                    Grammar: A,
                    Rule: E
                }
            }
            ,
            E.exports ? E.exports = T() : this.nearley = T()
        }
    }
      , T = {};
    function R(A) {
        var S = T[A];
        if (void 0 !== S)
            return S.exports;
        var N = T[A] = {
            exports: {}
        };
        return E[A].call(N.exports, N, N.exports, R),
        N.exports
    }
    R.n = E=>{
        var T = E && E.__esModule ? ()=>E.default : ()=>E;
        return R.d(T, {
            a: T
        }),
        T
    }
    ,
    R.d = (E,T)=>{
        for (var A in T)
            R.o(T, A) && !R.o(E, A) && Object.defineProperty(E, A, {
                enumerable: !0,
                get: T[A]
            })
    }
    ,
    R.o = (E,T)=>Object.prototype.hasOwnProperty.call(E, T),
    R.r = E=>{
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(E, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(E, "__esModule", {
            value: !0
        })
    }
    ;
    var A = {};
    return (()=>{
        "use strict";
        R.r(A),
        R.d(A, {
            ConfigError: ()=>HA,
            bigquery: ()=>c,
            db2: ()=>g,
            db2i: ()=>z,
            expandPhrases: ()=>C,
            format: ()=>lA,
            formatDialect: ()=>VA,
            hive: ()=>LE,
            mariadb: ()=>rE,
            mysql: ()=>YE,
            n1ql: ()=>hE,
            plsql: ()=>$E,
            postgresql: ()=>ET,
            redshift: ()=>CT,
            singlestoredb: ()=>_R,
            snowflake: ()=>GR,
            spark: ()=>rT,
            sql: ()=>hT,
            sqlite: ()=>YT,
            supportedDialects: ()=>FA,
            transactsql: ()=>ER,
            trino: ()=>$T
        });
        var E, T = {};
        R.r(T),
        R.d(T, {
            bigquery: ()=>c,
            db2: ()=>g,
            db2i: ()=>z,
            hive: ()=>LE,
            mariadb: ()=>rE,
            mysql: ()=>YE,
            n1ql: ()=>hE,
            plsql: ()=>$E,
            postgresql: ()=>ET,
            redshift: ()=>CT,
            singlestoredb: ()=>_R,
            snowflake: ()=>GR,
            spark: ()=>rT,
            sql: ()=>hT,
            sqlite: ()=>YT,
            transactsql: ()=>ER,
            trino: ()=>$T
        }),
        function(E) {
            E.QUOTED_IDENTIFIER = "QUOTED_IDENTIFIER",
            E.IDENTIFIER = "IDENTIFIER",
            E.STRING = "STRING",
            E.VARIABLE = "VARIABLE",
            E.RESERVED_KEYWORD = "RESERVED_KEYWORD",
            E.RESERVED_FUNCTION_NAME = "RESERVED_FUNCTION_NAME",
            E.RESERVED_PHRASE = "RESERVED_PHRASE",
            E.RESERVED_SET_OPERATION = "RESERVED_SET_OPERATION",
            E.RESERVED_CLAUSE = "RESERVED_CLAUSE",
            E.RESERVED_SELECT = "RESERVED_SELECT",
            E.RESERVED_JOIN = "RESERVED_JOIN",
            E.ARRAY_IDENTIFIER = "ARRAY_IDENTIFIER",
            E.ARRAY_KEYWORD = "ARRAY_KEYWORD",
            E.CASE = "CASE",
            E.END = "END",
            E.WHEN = "WHEN",
            E.ELSE = "ELSE",
            E.THEN = "THEN",
            E.LIMIT = "LIMIT",
            E.BETWEEN = "BETWEEN",
            E.AND = "AND",
            E.OR = "OR",
            E.XOR = "XOR",
            E.OPERATOR = "OPERATOR",
            E.COMMA = "COMMA",
            E.ASTERISK = "ASTERISK",
            E.DOT = "DOT",
            E.OPEN_PAREN = "OPEN_PAREN",
            E.CLOSE_PAREN = "CLOSE_PAREN",
            E.LINE_COMMENT = "LINE_COMMENT",
            E.BLOCK_COMMENT = "BLOCK_COMMENT",
            E.NUMBER = "NUMBER",
            E.NAMED_PARAMETER = "NAMED_PARAMETER",
            E.QUOTED_PARAMETER = "QUOTED_PARAMETER",
            E.NUMBERED_PARAMETER = "NUMBERED_PARAMETER",
            E.POSITIONAL_PARAMETER = "POSITIONAL_PARAMETER",
            E.CUSTOM_PARAMETER = "CUSTOM_PARAMETER",
            E.DELIMITER = "DELIMITER",
            E.EOF = "EOF"
        }(E = E || (E = {}));
        const S = T=>({
            type: E.EOF,
            raw: "«EOF»",
            text: "«EOF»",
            start: T
        })
          , N = S(1 / 0)
          , O = E=>T=>T.type === E.type && T.text === E.text
          , I = {
            ARRAY: O({
                text: "ARRAY",
                type: E.RESERVED_KEYWORD
            }),
            BY: O({
                text: "BY",
                type: E.RESERVED_KEYWORD
            }),
            SET: O({
                text: "SET",
                type: E.RESERVED_CLAUSE
            }),
            STRUCT: O({
                text: "STRUCT",
                type: E.RESERVED_KEYWORD
            }),
            WINDOW: O({
                text: "WINDOW",
                type: E.RESERVED_CLAUSE
            }),
            VALUES: O({
                text: "VALUES",
                type: E.RESERVED_CLAUSE
            })
        }
          , L = T=>T === E.RESERVED_KEYWORD || T === E.RESERVED_FUNCTION_NAME || T === E.RESERVED_PHRASE || T === E.RESERVED_CLAUSE || T === E.RESERVED_SELECT || T === E.RESERVED_SET_OPERATION || T === E.RESERVED_JOIN || T === E.ARRAY_KEYWORD || T === E.CASE || T === E.END || T === E.WHEN || T === E.ELSE || T === E.THEN || T === E.LIMIT || T === E.BETWEEN || T === E.AND || T === E.OR || T === E.XOR
          , C = E=>E.flatMap(_)
          , _ = E=>r(P(E)).map(e)
          , e = E=>E.replace(/ +/g, " ").trim()
          , P = E=>({
            type: "mandatory_block",
            items: D(E, 0)[0]
        })
          , D = (E,T,R)=>{
            const A = [];
            for (; E[T]; ) {
                const [S,N] = s(E, T);
                if (A.push(S),
                "|" !== E[T = N]) {
                    if ("}" === E[T] || "]" === E[T]) {
                        if (R !== E[T])
                            throw new Error(`Unbalanced parenthesis in: ${E}`);
                        return [A, ++T]
                    }
                    if (T === E.length) {
                        if (R)
                            throw new Error(`Unbalanced parenthesis in: ${E}`);
                        return [A, T]
                    }
                    throw new Error(`Unexpected "${E[T]}"`)
                }
                T++
            }
            return [A, T]
        }
          , s = (E,T)=>{
            const R = [];
            for (; ; ) {
                const [A,S] = M(E, T);
                if (!A)
                    break;
                R.push(A),
                T = S
            }
            return 1 === R.length ? [R[0], T] : [{
                type: "concatenation",
                items: R
            }, T]
        }
          , M = (E,T)=>{
            if ("{" === E[T])
                return U(E, T + 1);
            if ("[" === E[T])
                return t(E, T + 1);
            {
                let R = "";
                for (; E[T] && /[A-Za-z0-9_ ]/.test(E[T]); )
                    R += E[T],
                    T++;
                return [R, T]
            }
        }
          , U = (E,T)=>{
            const [R,A] = D(E, T, "}");
            return [{
                type: "mandatory_block",
                items: R
            }, A]
        }
          , t = (E,T)=>{
            const [R,A] = D(E, T, "]");
            return [{
                type: "optional_block",
                items: R
            }, A]
        }
          , r = E=>{
            if ("string" == typeof E)
                return [E];
            if ("concatenation" === E.type)
                return E.items.map(r).reduce(G, [""]);
            if ("mandatory_block" === E.type)
                return E.items.flatMap(r);
            if ("optional_block" === E.type)
                return ["", ...E.items.flatMap(r)];
            throw new Error(`Unknown node type: ${E}`)
        }
          , G = (E,T)=>{
            const R = [];
            for (const A of E)
                for (const E of T)
                    R.push(A + E);
            return R
        }
          , n = E=>E[E.length - 1]
          , i = E=>E.sort(((E,T)=>T.length - E.length || E.localeCompare(T)))
          , a = E=>E.replace(/\s+/gu, " ")
          , o = E=>{
            return T = Object.values(E).flat(),
            [...new Set(T)];
            var T
        }
          , H = E=>/\n/.test(E)
          , B = o({
            keywords: ["ALL", "AND", "ANY", "ARRAY", "AS", "ASC", "ASSERT_ROWS_MODIFIED", "AT", "BETWEEN", "BY", "CASE", "CAST", "COLLATE", "CONTAINS", "CREATE", "CROSS", "CUBE", "CURRENT", "DEFAULT", "DEFINE", "DESC", "DISTINCT", "ELSE", "END", "ENUM", "ESCAPE", "EXCEPT", "EXCLUDE", "EXISTS", "EXTRACT", "FALSE", "FETCH", "FOLLOWING", "FOR", "FROM", "FULL", "GROUP", "GROUPING", "GROUPS", "HASH", "HAVING", "IF", "IGNORE", "IN", "INNER", "INTERSECT", "INTERVAL", "INTO", "IS", "JOIN", "LATERAL", "LEFT", "LIKE", "LIMIT", "LOOKUP", "MERGE", "NATURAL", "NEW", "NO", "NOT", "NULL", "NULLS", "OF", "ON", "OR", "ORDER", "OUTER", "OVER", "PARTITION", "PRECEDING", "PROTO", "RANGE", "RECURSIVE", "RESPECT", "RIGHT", "ROLLUP", "ROWS", "SELECT", "SET", "SOME", "STRUCT", "TABLE", "TABLESAMPLE", "THEN", "TO", "TREAT", "TRUE", "UNBOUNDED", "UNION", "UNNEST", "USING", "WHEN", "WHERE", "WINDOW", "WITH", "WITHIN"],
            datatypes: ["ARRAY", "BOOL", "BYTES", "DATE", "DATETIME", "GEOGRAPHY", "INTERVAL", "INT64", "INT", "SMALLINT", "INTEGER", "BIGINT", "TINYINT", "BYTEINT", "NUMERIC", "DECIMAL", "BIGNUMERIC", "BIGDECIMAL", "FLOAT64", "STRING", "STRUCT", "TIME", "TIMEZONE"],
            stringFormat: ["HEX", "BASEX", "BASE64M", "ASCII", "UTF-8", "UTF8"],
            misc: ["SAFE"],
            ddl: ["LIKE", "COPY", "CLONE", "IN", "OUT", "INOUT", "RETURNS", "LANGUAGE", "CASCADE", "RESTRICT", "DETERMINISTIC"]
        })
          , F = o({
            aead: ["KEYS.NEW_KEYSET", "KEYS.ADD_KEY_FROM_RAW_BYTES", "AEAD.DECRYPT_BYTES", "AEAD.DECRYPT_STRING", "AEAD.ENCRYPT", "KEYS.KEYSET_CHAIN", "KEYS.KEYSET_FROM_JSON", "KEYS.KEYSET_TO_JSON", "KEYS.ROTATE_KEYSET", "KEYS.KEYSET_LENGTH"],
            aggregateAnalytic: ["ANY_VALUE", "ARRAY_AGG", "AVG", "CORR", "COUNT", "COUNTIF", "COVAR_POP", "COVAR_SAMP", "MAX", "MIN", "ST_CLUSTERDBSCAN", "STDDEV_POP", "STDDEV_SAMP", "STRING_AGG", "SUM", "VAR_POP", "VAR_SAMP"],
            aggregate: ["ANY_VALUE", "ARRAY_AGG", "ARRAY_CONCAT_AGG", "AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "COUNT", "COUNTIF", "LOGICAL_AND", "LOGICAL_OR", "MAX", "MIN", "STRING_AGG", "SUM"],
            approximateAggregate: ["APPROX_COUNT_DISTINCT", "APPROX_QUANTILES", "APPROX_TOP_COUNT", "APPROX_TOP_SUM"],
            array: ["ARRAY_CONCAT", "ARRAY_LENGTH", "ARRAY_TO_STRING", "GENERATE_ARRAY", "GENERATE_DATE_ARRAY", "GENERATE_TIMESTAMP_ARRAY", "ARRAY_REVERSE", "OFFSET", "SAFE_OFFSET", "ORDINAL", "SAFE_ORDINAL"],
            bitwise: ["BIT_COUNT"],
            conversion: ["PARSE_BIGNUMERIC", "PARSE_NUMERIC", "SAFE_CAST"],
            date: ["CURRENT_DATE", "EXTRACT", "DATE", "DATE_ADD", "DATE_SUB", "DATE_DIFF", "DATE_TRUNC", "DATE_FROM_UNIX_DATE", "FORMAT_DATE", "LAST_DAY", "PARSE_DATE", "UNIX_DATE"],
            datetime: ["CURRENT_DATETIME", "DATETIME", "EXTRACT", "DATETIME_ADD", "DATETIME_SUB", "DATETIME_DIFF", "DATETIME_TRUNC", "FORMAT_DATETIME", "LAST_DAY", "PARSE_DATETIME"],
            debugging: ["ERROR"],
            federatedQuery: ["EXTERNAL_QUERY"],
            geography: ["S2_CELLIDFROMPOINT", "S2_COVERINGCELLIDS", "ST_ANGLE", "ST_AREA", "ST_ASBINARY", "ST_ASGEOJSON", "ST_ASTEXT", "ST_AZIMUTH", "ST_BOUNDARY", "ST_BOUNDINGBOX", "ST_BUFFER", "ST_BUFFERWITHTOLERANCE", "ST_CENTROID", "ST_CENTROID_AGG", "ST_CLOSESTPOINT", "ST_CLUSTERDBSCAN", "ST_CONTAINS", "ST_CONVEXHULL", "ST_COVEREDBY", "ST_COVERS", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_DUMP", "ST_DWITHIN", "ST_ENDPOINT", "ST_EQUALS", "ST_EXTENT", "ST_EXTERIORRING", "ST_GEOGFROM", "ST_GEOGFROMGEOJSON", "ST_GEOGFROMTEXT", "ST_GEOGFROMWKB", "ST_GEOGPOINT", "ST_GEOGPOINTFROMGEOHASH", "ST_GEOHASH", "ST_GEOMETRYTYPE", "ST_INTERIORRINGS", "ST_INTERSECTION", "ST_INTERSECTS", "ST_INTERSECTSBOX", "ST_ISCOLLECTION", "ST_ISEMPTY", "ST_LENGTH", "ST_MAKELINE", "ST_MAKEPOLYGON", "ST_MAKEPOLYGONORIENTED", "ST_MAXDISTANCE", "ST_NPOINTS", "ST_NUMGEOMETRIES", "ST_NUMPOINTS", "ST_PERIMETER", "ST_POINTN", "ST_SIMPLIFY", "ST_SNAPTOGRID", "ST_STARTPOINT", "ST_TOUCHES", "ST_UNION", "ST_UNION_AGG", "ST_WITHIN", "ST_X", "ST_Y"],
            hash: ["FARM_FINGERPRINT", "MD5", "SHA1", "SHA256", "SHA512"],
            hll: ["HLL_COUNT.INIT", "HLL_COUNT.MERGE", "HLL_COUNT.MERGE_PARTIAL", "HLL_COUNT.EXTRACT"],
            interval: ["MAKE_INTERVAL", "EXTRACT", "JUSTIFY_DAYS", "JUSTIFY_HOURS", "JUSTIFY_INTERVAL"],
            json: ["JSON_EXTRACT", "JSON_QUERY", "JSON_EXTRACT_SCALAR", "JSON_VALUE", "JSON_EXTRACT_ARRAY", "JSON_QUERY_ARRAY", "JSON_EXTRACT_STRING_ARRAY", "JSON_VALUE_ARRAY", "TO_JSON_STRING"],
            math: ["ABS", "SIGN", "IS_INF", "IS_NAN", "IEEE_DIVIDE", "RAND", "SQRT", "POW", "POWER", "EXP", "LN", "LOG", "LOG10", "GREATEST", "LEAST", "DIV", "SAFE_DIVIDE", "SAFE_MULTIPLY", "SAFE_NEGATE", "SAFE_ADD", "SAFE_SUBTRACT", "MOD", "ROUND", "TRUNC", "CEIL", "CEILING", "FLOOR", "COS", "COSH", "ACOS", "ACOSH", "SIN", "SINH", "ASIN", "ASINH", "TAN", "TANH", "ATAN", "ATANH", "ATAN2", "RANGE_BUCKET"],
            navigation: ["FIRST_VALUE", "LAST_VALUE", "NTH_VALUE", "LEAD", "LAG", "PERCENTILE_CONT", "PERCENTILE_DISC"],
            net: ["NET.IP_FROM_STRING", "NET.SAFE_IP_FROM_STRING", "NET.IP_TO_STRING", "NET.IP_NET_MASK", "NET.IP_TRUNC", "NET.IPV4_FROM_INT64", "NET.IPV4_TO_INT64", "NET.HOST", "NET.PUBLIC_SUFFIX", "NET.REG_DOMAIN"],
            numbering: ["RANK", "DENSE_RANK", "PERCENT_RANK", "CUME_DIST", "NTILE", "ROW_NUMBER"],
            security: ["SESSION_USER"],
            statisticalAggregate: ["CORR", "COVAR_POP", "COVAR_SAMP", "STDDEV_POP", "STDDEV_SAMP", "STDDEV", "VAR_POP", "VAR_SAMP", "VARIANCE"],
            string: ["ASCII", "BYTE_LENGTH", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHR", "CODE_POINTS_TO_BYTES", "CODE_POINTS_TO_STRING", "CONCAT", "CONTAINS_SUBSTR", "ENDS_WITH", "FORMAT", "FROM_BASE32", "FROM_BASE64", "FROM_HEX", "INITCAP", "INSTR", "LEFT", "LENGTH", "LPAD", "LOWER", "LTRIM", "NORMALIZE", "NORMALIZE_AND_CASEFOLD", "OCTET_LENGTH", "REGEXP_CONTAINS", "REGEXP_EXTRACT", "REGEXP_EXTRACT_ALL", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPLACE", "REPEAT", "REVERSE", "RIGHT", "RPAD", "RTRIM", "SAFE_CONVERT_BYTES_TO_STRING", "SOUNDEX", "SPLIT", "STARTS_WITH", "STRPOS", "SUBSTR", "SUBSTRING", "TO_BASE32", "TO_BASE64", "TO_CODE_POINTS", "TO_HEX", "TRANSLATE", "TRIM", "UNICODE", "UPPER"],
            time: ["CURRENT_TIME", "TIME", "EXTRACT", "TIME_ADD", "TIME_SUB", "TIME_DIFF", "TIME_TRUNC", "FORMAT_TIME", "PARSE_TIME"],
            timestamp: ["CURRENT_TIMESTAMP", "EXTRACT", "STRING", "TIMESTAMP", "TIMESTAMP_ADD", "TIMESTAMP_SUB", "TIMESTAMP_DIFF", "TIMESTAMP_TRUNC", "FORMAT_TIMESTAMP", "PARSE_TIMESTAMP", "TIMESTAMP_SECONDS", "TIMESTAMP_MILLIS", "TIMESTAMP_MICROS", "UNIX_SECONDS", "UNIX_MILLIS", "UNIX_MICROS"],
            uuid: ["GENERATE_UUID"],
            conditional: ["COALESCE", "IF", "IFNULL", "NULLIF"],
            legacyAggregate: ["AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "CORR", "COUNT", "COVAR_POP", "COVAR_SAMP", "EXACT_COUNT_DISTINCT", "FIRST", "GROUP_CONCAT", "GROUP_CONCAT_UNQUOTED", "LAST", "MAX", "MIN", "NEST", "NTH", "QUANTILES", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUM", "TOP", "UNIQUE", "VARIANCE", "VAR_POP", "VAR_SAMP"],
            legacyBitwise: ["BIT_COUNT"],
            legacyCasting: ["BOOLEAN", "BYTES", "CAST", "FLOAT", "HEX_STRING", "INTEGER", "STRING"],
            legacyComparison: ["COALESCE", "GREATEST", "IFNULL", "IS_INF", "IS_NAN", "IS_EXPLICITLY_DEFINED", "LEAST", "NVL"],
            legacyDatetime: ["CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATE", "DATE_ADD", "DATEDIFF", "DAY", "DAYOFWEEK", "DAYOFYEAR", "FORMAT_UTC_USEC", "HOUR", "MINUTE", "MONTH", "MSEC_TO_TIMESTAMP", "NOW", "PARSE_UTC_USEC", "QUARTER", "SEC_TO_TIMESTAMP", "SECOND", "STRFTIME_UTC_USEC", "TIME", "TIMESTAMP", "TIMESTAMP_TO_MSEC", "TIMESTAMP_TO_SEC", "TIMESTAMP_TO_USEC", "USEC_TO_TIMESTAMP", "UTC_USEC_TO_DAY", "UTC_USEC_TO_HOUR", "UTC_USEC_TO_MONTH", "UTC_USEC_TO_WEEK", "UTC_USEC_TO_YEAR", "WEEK", "YEAR"],
            legacyIp: ["FORMAT_IP", "PARSE_IP", "FORMAT_PACKED_IP", "PARSE_PACKED_IP"],
            legacyJson: ["JSON_EXTRACT", "JSON_EXTRACT_SCALAR"],
            legacyMath: ["ABS", "ACOS", "ACOSH", "ASIN", "ASINH", "ATAN", "ATANH", "ATAN2", "CEIL", "COS", "COSH", "DEGREES", "EXP", "FLOOR", "LN", "LOG", "LOG2", "LOG10", "PI", "POW", "RADIANS", "RAND", "ROUND", "SIN", "SINH", "SQRT", "TAN", "TANH"],
            legacyRegex: ["REGEXP_MATCH", "REGEXP_EXTRACT", "REGEXP_REPLACE"],
            legacyString: ["CONCAT", "INSTR", "LEFT", "LENGTH", "LOWER", "LPAD", "LTRIM", "REPLACE", "RIGHT", "RPAD", "RTRIM", "SPLIT", "SUBSTR", "UPPER"],
            legacyTableWildcard: ["TABLE_DATE_RANGE", "TABLE_DATE_RANGE_STRICT", "TABLE_QUERY"],
            legacyUrl: ["HOST", "DOMAIN", "TLD"],
            legacyWindow: ["AVG", "COUNT", "MAX", "MIN", "STDDEV", "SUM", "CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "RANK", "RATIO_TO_REPORT", "ROW_NUMBER"],
            legacyMisc: ["CURRENT_USER", "EVERY", "FROM_BASE64", "HASH", "FARM_FINGERPRINT", "IF", "POSITION", "SHA1", "SOME", "TO_BASE64"],
            other: ["BQ.JOBS.CANCEL", "BQ.REFRESH_MATERIALIZED_VIEW"],
            ddl: ["OPTIONS"],
            pivot: ["PIVOT", "UNPIVOT"],
            dataTypes: ["BYTES", "NUMERIC", "DECIMAL", "BIGNUMERIC", "BIGDECIMAL", "STRING"]
        })
          , Y = C(["SELECT [ALL | DISTINCT] [AS STRUCT | AS VALUE]"])
          , l = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "QUALIFY", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "OMIT RECORD IF", "INSERT [INTO]", "VALUES", "SET", "MERGE [INTO]", "WHEN [NOT] MATCHED [BY SOURCE | BY TARGET] [THEN]", "UPDATE SET", "CREATE [OR REPLACE] [MATERIALIZED] VIEW [IF NOT EXISTS]", "CREATE [OR REPLACE] [TEMP|TEMPORARY|SNAPSHOT|EXTERNAL] TABLE [IF NOT EXISTS]", "CLUSTER BY", "FOR SYSTEM_TIME AS OF", "WITH CONNECTION", "WITH PARTITION COLUMNS", "REMOTE WITH CONNECTION"])
          , V = C(["UPDATE", "DELETE [FROM]", "DROP [SNAPSHOT | EXTERNAL] TABLE [IF EXISTS]", "ALTER TABLE [IF EXISTS]", "ADD COLUMN [IF NOT EXISTS]", "DROP COLUMN [IF EXISTS]", "RENAME TO", "ALTER COLUMN [IF EXISTS]", "SET DEFAULT COLLATE", "SET OPTIONS", "DROP NOT NULL", "SET DATA TYPE", "ALTER SCHEMA [IF EXISTS]", "ALTER [MATERIALIZED] VIEW [IF EXISTS]", "ALTER BI_CAPACITY", "TRUNCATE TABLE", "CREATE SCHEMA [IF NOT EXISTS]", "DEFAULT COLLATE", "CREATE [OR REPLACE] [TEMP|TEMPORARY|TABLE] FUNCTION [IF NOT EXISTS]", "CREATE [OR REPLACE] PROCEDURE [IF NOT EXISTS]", "CREATE [OR REPLACE] ROW ACCESS POLICY [IF NOT EXISTS]", "GRANT TO", "FILTER USING", "CREATE CAPACITY", "AS JSON", "CREATE RESERVATION", "CREATE ASSIGNMENT", "CREATE SEARCH INDEX [IF NOT EXISTS]", "DROP SCHEMA [IF EXISTS]", "DROP [MATERIALIZED] VIEW [IF EXISTS]", "DROP [TABLE] FUNCTION [IF EXISTS]", "DROP PROCEDURE [IF EXISTS]", "DROP ROW ACCESS POLICY", "DROP ALL ROW ACCESS POLICIES", "DROP CAPACITY [IF EXISTS]", "DROP RESERVATION [IF EXISTS]", "DROP ASSIGNMENT [IF EXISTS]", "DROP SEARCH INDEX [IF EXISTS]", "DROP [IF EXISTS]", "GRANT", "REVOKE", "DECLARE", "EXECUTE IMMEDIATE", "LOOP", "END LOOP", "REPEAT", "END REPEAT", "WHILE", "END WHILE", "BREAK", "LEAVE", "CONTINUE", "ITERATE", "FOR", "END FOR", "BEGIN", "BEGIN TRANSACTION", "COMMIT TRANSACTION", "ROLLBACK TRANSACTION", "RAISE", "RETURN", "CALL", "ASSERT", "EXPORT DATA"])
          , p = C(["UNION {ALL | DISTINCT}", "EXCEPT DISTINCT", "INTERSECT DISTINCT"])
          , W = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN"])
          , X = C(["TABLESAMPLE SYSTEM", "ANY TYPE", "ALL COLUMNS", "NOT DETERMINISTIC", "{ROWS | RANGE} BETWEEN", "IS [NOT] DISTINCT FROM"])
          , c = {
            name: "bigquery",
            tokenizerOptions: {
                reservedSelect: Y,
                reservedClauses: [...l, ...V],
                reservedSetOperations: p,
                reservedJoins: W,
                reservedPhrases: X,
                reservedKeywords: B,
                reservedFunctionNames: F,
                extraParens: ["[]"],
                stringTypes: [{
                    quote: '""".."""',
                    prefixes: ["R", "B", "RB", "BR"]
                }, {
                    quote: "'''..'''",
                    prefixes: ["R", "B", "RB", "BR"]
                }, '""-bs', "''-bs", {
                    quote: '""-raw',
                    prefixes: ["R", "B", "RB", "BR"],
                    requirePrefix: !0
                }, {
                    quote: "''-raw",
                    prefixes: ["R", "B", "RB", "BR"],
                    requirePrefix: !0
                }],
                identTypes: ["``"],
                identChars: {
                    dashes: !0
                },
                paramTypes: {
                    positional: !0,
                    named: ["@"],
                    quoted: ["@"]
                },
                variableTypes: [{
                    regex: String.raw`@@\w+`
                }],
                lineCommentTypes: ["--", "#"],
                operators: ["&", "|", "^", "~", ">>", "<<", "||", "=>"],
                postProcess: function(T) {
                    return function(T) {
                        let R = N;
                        return T.map((T=>"OFFSET" === T.text && "[" === R.text ? (R = T,
                        Object.assign(Object.assign({}, T), {
                            type: E.RESERVED_FUNCTION_NAME
                        })) : (R = T,
                        T)))
                    }(function(T) {
                        var R;
                        const A = [];
                        for (let S = 0; S < T.length; S++) {
                            const N = T[S];
                            if ((I.ARRAY(N) || I.STRUCT(N)) && "<" === (null === (R = T[S + 1]) || void 0 === R ? void 0 : R.text)) {
                                const R = u(T, S + 1)
                                  , O = T.slice(S, R + 1);
                                A.push({
                                    type: E.IDENTIFIER,
                                    raw: O.map(m("raw")).join(""),
                                    text: O.map(m("text")).join(""),
                                    start: N.start
                                }),
                                S = R
                            } else
                                A.push(N)
                        }
                        return A
                    }(T))
                }
            },
            formatOptions: {
                onelineClauses: V
            }
        }
          , m = T=>R=>R.type === E.IDENTIFIER || R.type === E.COMMA ? R[T] + " " : R[T];
        function u(E, T) {
            let R = 0;
            for (let A = T; A < E.length; A++) {
                const T = E[A];
                if ("<" === T.text ? R++ : ">" === T.text ? R-- : ">>" === T.text && (R -= 2),
                0 === R)
                    return A
            }
            return E.length - 1
        }
        const h = o({
            aggregate: ["ARRAY_AGG", "AVG", "CORRELATION", "COUNT", "COUNT_BIG", "COVARIANCE", "COVARIANCE_SAMP", "CUME_DIST", "GROUPING", "LISTAGG", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_ICPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "STDDEV", "STDDEV_SAMP", "SUM", "VARIANCE", "VARIANCE_SAMP", "XMLAGG", "XMLGROUP"],
            scalar: ["ABS", "ABSVAL", "ACOS", "ADD_DAYS", "ADD_HOURS", "ADD_MINUTES", "ADD_MONTHS", "ADD_SECONDS", "ADD_YEARS", "AGE", "ARRAY_DELETE", "ARRAY_FIRST", "ARRAY_LAST", "ARRAY_NEXT", "ARRAY_PRIOR", "ASCII", "ASCII_STR", "ASIN", "ATAN", "ATAN2", "ATANH", "BIGINT", "BINARY", "BITAND", "BITANDNOT", "BITOR", "BITXOR", "BITNOT", "BLOB", "BOOLEAN", "BPCHAR", "BSON_TO_JSON", "BTRIM", "CARDINALITY", "CEILING", "CEIL", "CHAR", "CHARACTER_LENGTH", "CHR", "CLOB", "COALESCE", "COLLATION_KEY", "COLLATION_KEY_BIT", "COMPARE_DECFLOAT", "CONCAT", "COS", "COSH", "COT", "CURSOR_ROWCOUNT", "DATAPARTITIONNUM", "DATE", "DATETIME", "DATE_PART", "DATE_TRUNC", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFWEEK", "DAYOFWEEK_ISO", "DAYOFYEAR", "DAYS", "DAYS_BETWEEN", "DAYS_TO_END_OF_MONTH", "DBCLOB", "DBPARTITIONNUM", "DECFLOAT", "DECFLOAT_FORMAT", "DECIMAL", "DEC", "DECODE", "DECRYPT_BIN", "DECRYPT_CHAR", "DEGREES", "DEREF", "DIFFERENCE", "DIGITS", "DOUBLE_PRECISION", "DOUBLE", "EMPTY_BLOB", "EMPTY_CLOB", "EMPTY_DBCLOB", "EMPTY_NCLOB", "ENCRYPT", "EVENT_MON_STATE", "EXP", "EXTRACT", "FIRST_DAY", "FLOAT", "FLOAT4", "FLOAT8", "FLOOR", "FROM_UTC_TIMESTAMP", "GENERATE_UNIQUE", "GETHINT", "GRAPHIC", "GREATEST", "HASH", "HASH4", "HASH8", "HASHEDVALUE", "HEX", "HEXTORAW", "HOUR", "HOURS_BETWEEN", "IDENTITY_VAL_LOCAL", "IFNULL", "INITCAP", "INSERT", "INSTR", "INSTR2", "INSTR4", "INSTRB", "INT", "INTERVAL", "INTEGER", "INT2", "INT4", "INT8", "INTNAND", "INTNOR", "INTNXOR", "INTNNOT", "ISNULL", "JSON_ARRAY", "JSON_OBJECT", "JSON_QUERY", "JSON_TO_BSON", "JSON_VALUE", "JULIAN_DAY", "LAST_DAY", "LCASE", "LEAST", "LEFT", "LENGTH", "LENGTH2", "LENGTH4", "LENGTHB", "LN", "LOCATE", "LOCATE_IN_STRING", "LOG10", "LONG_VARCHAR", "LONG_VARGRAPHIC", "LOWER", "LPAD", "LTRIM", "MAX", "MAX_CARDINALITY", "MICROSECOND", "MIDNIGHT_SECONDS", "MIN", "MINUTE", "MINUTES_BETWEEN", "MOD", "MONTH", "MONTHNAME", "MONTHS_BETWEEN", "MULTIPLY_ALT", "NCHAR", "NCHR", "NCLOB", "NVARCHAR", "NEXT_DAY", "NEXT_MONTH", "NEXT_QUARTER", "NEXT_WEEK", "NEXT_YEAR", "NORMALIZE_DECFLOAT", "NOW", "NULLIF", "NUMERIC", "NVL", "NVL2", "OCTET_LENGTH", "OVERLAY", "PARAMETER", "POSITION", "POSSTR", "POW", "POWER", "QUANTIZE", "QUARTER", "QUOTE_IDENT", "QUOTE_LITERAL", "RADIANS", "RAISE_ERROR", "RAND", "RANDOM", "RAWTOHEX", "REAL", "REC2XML", "REGEXP_COUNT", "REGEXP_EXTRACT", "REGEXP_INSTR", "REGEXP_LIKE", "REGEXP_MATCH_COUNT", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPEAT", "REPLACE", "RID and RID_BIT", "RIGHT", "ROUND", "ROUND_TIMESTAMP", "RPAD", "RTRIM", "SECLABEL", "SECLABEL_BY_NAME", "SECLABEL_TO_CHAR", "SECOND", "SECONDS_BETWEEN", "SIGN", "SIN", "SINH", "SMALLINT", "SOUNDEX", "SPACE", "SQRT", "STRIP", "STRLEFT", "STRPOS", "STRRIGHT", "SUBSTR", "SUBSTR2", "SUBSTR4", "SUBSTRB", "SUBSTRING", "TABLE_NAME", "TABLE_SCHEMA", "TAN", "TANH", "THIS_MONTH", "THIS_QUARTER", "THIS_WEEK", "THIS_YEAR", "TIME", "TIMESTAMP", "TIMESTAMP_FORMAT", "TIMESTAMP_ISO", "TIMESTAMPDIFF", "TIMEZONE", "TO_CHAR", "TO_CLOB", "TO_DATE", "TO_HEX", "TO_MULTI_BYTE", "TO_NCHAR", "TO_NCLOB", "TO_NUMBER", "TO_SINGLE_BYTE", "TO_TIMESTAMP", "TO_UTC_TIMESTAMP", "TOTALORDER", "TRANSLATE", "TRIM", "TRIM_ARRAY", "TRUNC_TIMESTAMP", "TRUNCATE", "TRUNC", "TYPE_ID", "TYPE_NAME", "TYPE_SCHEMA", "UCASE", "UNICODE_STR", "UPPER", "VALUE", "VARBINARY", "VARCHAR", "VARCHAR_BIT_FORMAT", "VARCHAR_FORMAT", "VARCHAR_FORMAT_BIT", "VARGRAPHIC", "VERIFY_GROUP_FOR_USER", "VERIFY_ROLE_FOR_USER", "VERIFY_TRUSTED_CONTEXT_ROLE_FOR_USER", "WEEK", "WEEK_ISO", "WEEKS_BETWEEN", "WIDTH_BUCKET", "XMLATTRIBUTES", "XMLCOMMENT", "XMLCONCAT", "XMLDOCUMENT", "XMLELEMENT", "XMLFOREST", "XMLNAMESPACES", "XMLPARSE", "XMLPI", "XMLQUERY", "XMLROW", "XMLSERIALIZE", "XMLTEXT", "XMLVALIDATE", "XMLXSROBJECTID", "XSLTRANSFORM", "YEAR", "YEARS_BETWEEN", "YMD_BETWEEN"],
            table: ["BASE_TABLE", "JSON_TABLE", "UNNEST", "XMLTABLE"],
            olap: ["RANK", "DENSE_RANK", "NTILE", "LAG", "LEAD", "ROW_NUMBER", "FIRST_VALUE", "LAST_VALUE", "NTH_VALUE", "RATIO_TO_REPORT"],
            cast: ["CAST"]
        })
          , d = o({
            standard: ["ACTIVATE", "ADD", "AFTER", "ALIAS", "ALL", "ALLOCATE", "ALLOW", "ALTER", "AND", "ANY", "AS", "ASENSITIVE", "ASSOCIATE", "ASUTIME", "AT", "ATTRIBUTES", "AUDIT", "AUTHORIZATION", "AUX", "AUXILIARY", "BEFORE", "BEGIN", "BETWEEN", "BINARY", "BUFFERPOOL", "BY", "CACHE", "CALL", "CALLED", "CAPTURE", "CARDINALITY", "CASCADED", "CASE", "CAST", "CCSID", "CHAR", "CHARACTER", "CHECK", "CLONE", "CLOSE", "CLUSTER", "COLLECTION", "COLLID", "COLUMN", "COMMENT", "COMMIT", "CONCAT", "CONDITION", "CONNECT", "CONNECTION", "CONSTRAINT", "CONTAINS", "CONTINUE", "COUNT", "COUNT_BIG", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_LC_CTYPE", "CURRENT_PATH", "CURRENT_SCHEMA", "CURRENT_SERVER", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_USER", "CURSOR", "CYCLE", "DATA", "DATABASE", "DATAPARTITIONNAME", "DATAPARTITIONNUM", "DATE", "DAY", "DAYS", "DB2GENERAL", "DB2GENRL", "DB2SQL", "DBINFO", "DBPARTITIONNAME", "DBPARTITIONNUM", "DEALLOCATE", "DECLARE", "DEFAULT", "DEFAULTS", "DEFINITION", "DELETE", "DENSERANK", "DENSE_RANK", "DESCRIBE", "DESCRIPTOR", "DETERMINISTIC", "DIAGNOSTICS", "DISABLE", "DISALLOW", "DISCONNECT", "DISTINCT", "DO", "DOCUMENT", "DOUBLE", "DROP", "DSSIZE", "DYNAMIC", "EACH", "EDITPROC", "ELSE", "ELSEIF", "ENABLE", "ENCODING", "ENCRYPTION", "END", "END-EXEC", "ENDING", "ERASE", "ESCAPE", "EVERY", "EXCEPT", "EXCEPTION", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXIT", "EXPLAIN", "EXTENDED", "EXTERNAL", "EXTRACT", "FENCED", "FETCH", "FIELDPROC", "FILE", "FINAL", "FIRST1", "FOR", "FOREIGN", "FREE", "FROM", "FULL", "FUNCTION", "GENERAL", "GENERATED", "GET", "GLOBAL", "GO", "GOTO", "GRANT", "GRAPHIC", "GROUP", "HANDLER", "HASH", "HASHED_VALUE", "HAVING", "HINT", "HOLD", "HOUR", "HOURS", "IDENTITY", "IF", "IMMEDIATE", "IMPORT", "IN", "INCLUDING", "INCLUSIVE", "INCREMENT", "INDEX", "INDICATOR", "INDICATORS", "INF", "INFINITY", "INHERIT", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INTEGRITY", "INTERSECT", "INTO", "IS", "ISNULL", "ISOBID", "ISOLATION", "ITERATE", "JAR", "JAVA", "JOIN", "KEEP", "KEY", "LABEL", "LANGUAGE", "LAST3", "LATERAL", "LC_CTYPE", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINKTYPE", "LOCAL", "LOCALDATE", "LOCALE", "LOCALTIME", "LOCALTIMESTAMP", "LOCATOR", "LOCATORS", "LOCK", "LOCKMAX", "LOCKSIZE", "LONG", "LOOP", "MAINTAINED", "MATERIALIZED", "MAXVALUE", "MICROSECOND", "MICROSECONDS", "MINUTE", "MINUTES", "MINVALUE", "MODE", "MODIFIES", "MONTH", "MONTHS", "NAN", "NEW", "NEW_TABLE", "NEXTVAL", "NO", "NOCACHE", "NOCYCLE", "NODENAME", "NODENUMBER", "NOMAXVALUE", "NOMINVALUE", "NONE", "NOORDER", "NORMALIZED", "NOT2", "NOTNULL", "NULL", "NULLS", "NUMPARTS", "OBID", "OF", "OFF", "OFFSET", "OLD", "OLD_TABLE", "ON", "OPEN", "OPTIMIZATION", "OPTIMIZE", "OPTION", "OR", "ORDER", "OUT", "OUTER", "OVER", "OVERRIDING", "PACKAGE", "PADDED", "PAGESIZE", "PARAMETER", "PART", "PARTITION", "PARTITIONED", "PARTITIONING", "PARTITIONS", "PASSWORD", "PATH", "PERCENT", "PIECESIZE", "PLAN", "POSITION", "PRECISION", "PREPARE", "PREVVAL", "PRIMARY", "PRIQTY", "PRIVILEGES", "PROCEDURE", "PROGRAM", "PSID", "PUBLIC", "QUERY", "QUERYNO", "RANGE", "RANK", "READ", "READS", "RECOVERY", "REFERENCES", "REFERENCING", "REFRESH", "RELEASE", "RENAME", "REPEAT", "RESET", "RESIGNAL", "RESTART", "RESTRICT", "RESULT", "RESULT_SET_LOCATOR", "RETURN", "RETURNS", "REVOKE", "RIGHT", "ROLE", "ROLLBACK", "ROUND_CEILING", "ROUND_DOWN", "ROUND_FLOOR", "ROUND_HALF_DOWN", "ROUND_HALF_EVEN", "ROUND_HALF_UP", "ROUND_UP", "ROUTINE", "ROW", "ROWNUMBER", "ROWS", "ROWSET", "ROW_NUMBER", "RRN", "RUN", "SAVEPOINT", "SCHEMA", "SCRATCHPAD", "SCROLL", "SEARCH", "SECOND", "SECONDS", "SECQTY", "SECURITY", "SELECT", "SENSITIVE", "SEQUENCE", "SESSION", "SESSION_USER", "SET", "SIGNAL", "SIMPLE", "SNAN", "SOME", "SOURCE", "SPECIFIC", "SQL", "SQLID", "STACKED", "STANDARD", "START", "STARTING", "STATEMENT", "STATIC", "STATMENT", "STAY", "STOGROUP", "STORES", "STYLE", "SUBSTRING", "SUMMARY", "SYNONYM", "SYSFUN", "SYSIBM", "SYSPROC", "SYSTEM", "SYSTEM_USER", "TABLE", "TABLESPACE", "THEN", "TIME", "TIMESTAMP", "TO", "TRANSACTION", "TRIGGER", "TRIM", "TRUNCATE", "TYPE", "UNDO", "UNION", "UNIQUE", "UNTIL", "UPDATE", "USAGE", "USER", "USING", "VALIDPROC", "VALUE", "VALUES", "VARIABLE", "VARIANT", "VCAT", "VERSION", "VIEW", "VOLATILE", "VOLUMES", "WHEN", "WHENEVER", "WHERE", "WHILE", "WITH", "WITHOUT", "WLM", "WRITE", "XMLELEMENT", "XMLEXISTS", "XMLNAMESPACES", "YEAR", "YEARS"]
        })
          , K = C(["SELECT [ALL | DISTINCT]"])
          , y = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER BY [INPUT SEQUENCE]", "LIMIT", "OFFSET", "FETCH NEXT", "FOR UPDATE [OF]", "FOR {READ | FETCH} ONLY", "FOR {RR | CS | UR | RS} [USE AND KEEP {SHARE | UPDATE | EXCLUSIVE} LOCKS]", "WAIT FOR OUTCOME", "SKIP LOCKED DATA", "INTO", "INSERT INTO", "VALUES", "SET", "MERGE INTO", "WHEN [NOT] MATCHED [THEN]", "UPDATE SET", "INSERT", "CREATE [OR REPLACE] VIEW", "CREATE [GLOBAL TEMPORARY | EXTERNAL] TABLE [IF NOT EXISTS]"])
          , f = C(["UPDATE", "WHERE CURRENT OF", "WITH {RR | RS | CS | UR}", "DELETE FROM", "DROP TABLE [IF EXISTS]", "ALTER TABLE", "ADD [COLUMN]", "DROP [COLUMN]", "RENAME COLUMN", "ALTER [COLUMN]", "SET DATA TYPE", "SET NOT NULL", "DROP {DEFAULT | GENERATED | NOT NULL}", "TRUNCATE [TABLE]", "ALLOCATE", "ALTER AUDIT POLICY", "ALTER BUFFERPOOL", "ALTER DATABASE PARTITION GROUP", "ALTER DATABASE", "ALTER EVENT MONITOR", "ALTER FUNCTION", "ALTER HISTOGRAM TEMPLATE", "ALTER INDEX", "ALTER MASK", "ALTER METHOD", "ALTER MODULE", "ALTER NICKNAME", "ALTER PACKAGE", "ALTER PERMISSION", "ALTER PROCEDURE", "ALTER SCHEMA", "ALTER SECURITY LABEL COMPONENT", "ALTER SECURITY POLICY", "ALTER SEQUENCE", "ALTER SERVER", "ALTER SERVICE CLASS", "ALTER STOGROUP", "ALTER TABLESPACE", "ALTER THRESHOLD", "ALTER TRIGGER", "ALTER TRUSTED CONTEXT", "ALTER TYPE", "ALTER USAGE LIST", "ALTER USER MAPPING", "ALTER VIEW", "ALTER WORK ACTION SET", "ALTER WORK CLASS SET", "ALTER WORKLOAD", "ALTER WRAPPER", "ALTER XSROBJECT", "ALTER STOGROUP", "ALTER TABLESPACE", "ALTER TRIGGER", "ALTER TRUSTED CONTEXT", "ALTER VIEW", "ASSOCIATE [RESULT SET] {LOCATOR | LOCATORS}", "AUDIT", "BEGIN DECLARE SECTION", "CALL", "CLOSE", "COMMENT ON", "COMMIT [WORK]", "CONNECT", "CREATE [OR REPLACE] [PUBLIC] ALIAS", "CREATE AUDIT POLICY", "CREATE BUFFERPOOL", "CREATE DATABASE PARTITION GROUP", "CREATE EVENT MONITOR", "CREATE [OR REPLACE] FUNCTION", "CREATE FUNCTION MAPPING", "CREATE HISTOGRAM TEMPLATE", "CREATE [UNIQUE] INDEX", "CREATE INDEX EXTENSION", "CREATE [OR REPLACE] MASK", "CREATE [SPECIFIC] METHOD", "CREATE [OR REPLACE] MODULE", "CREATE [OR REPLACE] NICKNAME", "CREATE [OR REPLACE] PERMISSION", "CREATE [OR REPLACE] PROCEDURE", "CREATE ROLE", "CREATE SCHEMA", "CREATE SECURITY LABEL [COMPONENT]", "CREATE SECURITY POLICY", "CREATE [OR REPLACE] SEQUENCE", "CREATE SERVICE CLASS", "CREATE SERVER", "CREATE STOGROUP", "CREATE SYNONYM", "CREATE [LARGE | REGULAR | {SYSTEM | USER} TEMPORARY] TABLESPACE", "CREATE THRESHOLD", "CREATE {TRANSFORM | TRANSFORMS} FOR", "CREATE [OR REPLACE] TRIGGER", "CREATE TRUSTED CONTEXT", "CREATE [OR REPLACE] TYPE", "CREATE TYPE MAPPING", "CREATE USAGE LIST", "CREATE USER MAPPING FOR", "CREATE [OR REPLACE] VARIABLE", "CREATE WORK ACTION SET", "CREATE WORK CLASS SET", "CREATE WORKLOAD", "CREATE WRAPPER", "DECLARE", "DECLARE GLOBAL TEMPORARY TABLE", "DESCRIBE [INPUT | OUTPUT]", "DISCONNECT", "DROP [PUBLIC] ALIAS", "DROP AUDIT POLICY", "DROP BUFFERPOOL", "DROP DATABASE PARTITION GROUP", "DROP EVENT MONITOR", "DROP [SPECIFIC] FUNCTION", "DROP FUNCTION MAPPING", "DROP HISTOGRAM TEMPLATE", "DROP INDEX [EXTENSION]", "DROP MASK", "DROP [SPECIFIC] METHOD", "DROP MODULE", "DROP NICKNAME", "DROP PACKAGE", "DROP PERMISSION", "DROP [SPECIFIC] PROCEDURE", "DROP ROLE", "DROP SCHEMA", "DROP SECURITY LABEL [COMPONENT]", "DROP SECURITY POLICY", "DROP SEQUENCE", "DROP SERVER", "DROP SERVICE CLASS", "DROP STOGROUP", "DROP TABLE HIERARCHY", "DROP {TABLESPACE | TABLESPACES}", "DROP {TRANSFORM | TRANSFORMS}", "DROP THRESHOLD", "DROP TRIGGER", "DROP TRUSTED CONTEXT", "DROP TYPE [MAPPING]", "DROP USAGE LIST", "DROP USER MAPPING FOR", "DROP VARIABLE", "DROP VIEW [HIERARCHY]", "DROP WORK {ACTION | CLASS} SET", "DROP WORKLOAD", "DROP WRAPPER", "DROP XSROBJECT", "END DECLARE SECTION", "EXECUTE [IMMEDIATE]", "EXPLAIN {PLAN [SECTION] | ALL}", "FETCH [FROM]", "FLUSH {BUFFERPOOL | BUFFERPOOLS} ALL", "FLUSH EVENT MONITOR", "FLUSH FEDERATED CACHE", "FLUSH OPTIMIZATION PROFILE CACHE", "FLUSH PACKAGE CACHE [DYNAMIC]", "FLUSH AUTHENTICATION CACHE [FOR ALL]", "FREE LOCATOR", "GET DIAGNOSTICS", "GOTO", "GRANT", "INCLUDE", "ITERATE", "LEAVE", "LOCK TABLE", "LOOP", "OPEN", "PIPE", "PREPARE", "REFRESH TABLE", "RELEASE", "RELEASE [TO] SAVEPOINT", "RENAME [TABLE | INDEX | STOGROUP | TABLESPACE]", "REPEAT", "RESIGNAL", "RETURN", "REVOKE", "ROLLBACK [WORK] [TO SAVEPOINT]", "SAVEPOINT", "SET COMPILATION ENVIRONMENT", "SET CONNECTION", "SET CURRENT", "SET ENCRYPTION PASSWORD", "SET EVENT MONITOR STATE", "SET INTEGRITY", "SET PASSTHRU", "SET PATH", "SET ROLE", "SET SCHEMA", "SET SERVER OPTION", "SET {SESSION AUTHORIZATION | SESSION_USER}", "SET USAGE LIST", "SIGNAL", "TRANSFER OWNERSHIP OF", "WHENEVER {NOT FOUND | SQLERROR | SQLWARNING}", "WHILE"])
          , b = C(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"])
          , x = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN"])
          , J = C(["ON DELETE", "ON UPDATE", "SET NULL", "{ROWS | RANGE} BETWEEN"])
          , g = {
            name: "db2",
            tokenizerOptions: {
                reservedSelect: K,
                reservedClauses: [...y, ...f],
                reservedSetOperations: b,
                reservedJoins: x,
                reservedPhrases: J,
                reservedKeywords: d,
                reservedFunctionNames: h,
                extraParens: ["[]"],
                stringTypes: [{
                    quote: "''-qq",
                    prefixes: ["G", "N", "U&"]
                }, {
                    quote: "''-raw",
                    prefixes: ["X", "BX", "GX", "UX"],
                    requirePrefix: !0
                }],
                identTypes: ['""-qq'],
                identChars: {
                    first: "@#$",
                    rest: "@#$"
                },
                paramTypes: {
                    positional: !0,
                    named: [":"]
                },
                paramChars: {
                    first: "@#$",
                    rest: "@#$"
                },
                operators: ["**", "%", "|", "&", "^", "~", "¬=", "¬>", "¬<", "!>", "!<", "^=", "^>", "^<", "||", "->", "=>"]
            },
            formatOptions: {
                onelineClauses: f
            }
        }
          , $ = o({
            aggregate: ["ARRAY_AGG", "AVG", "CORR", "CORRELATION", "COUNT", "COUNT_BIG", "COVAR_POP", "COVARIANCE", "COVAR", "COVAR_SAMP", "COVARIANCE_SAMP", "EVERY", "GROUPING", "JSON_ARRAYAGG", "JSON_OBJECTAGG", "LISTAGG", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "PERCENTILE_DISC", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "SOME", "STDDEV_POP", "STDDEV", "STDDEV_SAMP", "SUM", "VAR_POP", "VARIANCE", "VAR", "VAR_SAMP", "VARIANCE_SAMP", "XMLAGG", "XMLGROUP"],
            scalar: ["ABS", "ABSVAL", "ACOS", "ADD_DAYS", "ADD_HOURS", "ADD_MINUTES", "ADD_MONTHS", "ADD_SECONDS", "ADD_YEARS", "ANTILOG", "ARRAY_MAX_CARDINALITY", "ARRAY_TRIM", "ASCII", "ASIN", "ATAN", "ATAN2", "ATANH", "BASE64_DECODE", "BASE64_ENCODE", "BIGINT", "BINARY", "BIT_LENGTH", "BITAND", "BITANDNOT", "BITNOT", "BITOR", "BITXOR", "BLOB", "BOOLEAN", "BSON_TO_JSON", "CARDINALITY", "CEIL", "CEILING", "CHAR_LENGTH", "CHAR", "CHARACTER_LENGTH", "CHR", "CLOB", "COALESCE", "COMPARE_DECFLOAT", "CONCAT", "CONTAINS", "COS", "COSH", "COT", "CURDATE", "CURTIME", "DATABASE", "DATAPARTITIONNAME", "DATAPARTITIONNUM", "DATE", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFWEEK_ISO", "DAYOFWEEK", "DAYOFYEAR", "DAYS", "DBCLOB", "DBPARTITIONNAME", "DBPARTITIONNUM", "DEC", "DECFLOAT_FORMAT", "DECFLOAT_SORTKEY", "DECFLOAT", "DECIMAL", "DECRYPT_BINARY", "DECRYPT_BIT", "DECRYPT_CHAR", "DECRYPT_DB", "DEGREES", "DIFFERENCE", "DIGITS", "DLCOMMENT", "DLLINKTYPE", "DLURLCOMPLETE", "DLURLPATH", "DLURLPATHONLY", "DLURLSCHEME", "DLURLSERVER", "DLVALUE", "DOUBLE_PRECISION", "DOUBLE", "ENCRPYT", "ENCRYPT_AES", "ENCRYPT_AES256", "ENCRYPT_RC2", "ENCRYPT_TDES", "EXP", "EXTRACT", "FIRST_DAY", "FLOAT", "FLOOR", "GENERATE_UNIQUE", "GET_BLOB_FROM_FILE", "GET_CLOB_FROM_FILE", "GET_DBCLOB_FROM_FILE", "GET_XML_FILE", "GETHINT", "GRAPHIC", "GREATEST", "HASH_MD5", "HASH_ROW", "HASH_SHA1", "HASH_SHA256", "HASH_SHA512", "HASH_VALUES", "HASHED_VALUE", "HEX", "HEXTORAW", "HOUR", "HTML_ENTITY_DECODE", "HTML_ENTITY_ENCODE", "HTTP_DELETE_BLOB", "HTTP_DELETE", "HTTP_GET_BLOB", "HTTP_GET", "HTTP_PATCH_BLOB", "HTTP_PATCH", "HTTP_POST_BLOB", "HTTP_POST", "HTTP_PUT_BLOB", "HTTP_PUT", "IDENTITY_VAL_LOCAL", "IFNULL", "INSERT", "INSTR", "INT", "INTEGER", "INTERPRET", "ISFALSE", "ISNOTFALSE", "ISNOTTRUE", "ISTRUE", "JSON_ARRAY", "JSON_OBJECT", "JSON_QUERY", "JSON_TO_BSON", "JSON_UPDATE", "JSON_VALUE", "JULIAN_DAY", "LAND", "LAST_DAY", "LCASE", "LEAST", "LEFT", "LENGTH", "LN", "LNOT", "LOCATE_IN_STRING", "LOCATE", "LOG10", "LOR", "LOWER", "LPAD", "LTRIM", "MAX_CARDINALITY", "MAX", "MICROSECOND", "MIDNIGHT_SECONDS", "MIN", "MINUTE", "MOD", "MONTH", "MONTHNAME", "MONTHS_BETWEEN", "MQREAD", "MQREADCLOB", "MQRECEIVE", "MQRECEIVECLOB", "MQSEND", "MULTIPLY_ALT", "NEXT_DAY", "NORMALIZE_DECFLOAT", "NOW", "NULLIF", "NVL", "OCTET_LENGTH", "OVERLAY", "PI", "POSITION", "POSSTR", "POW", "POWER", "QUANTIZE", "QUARTER", "RADIANS", "RAISE_ERROR", "RANDOM or RAND", "REAL", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPEAT", "REPLACE", "RID", "RIGHT", "ROUND_TIMESTAMP", "ROUND", "ROWID", "RPAD", "RRN", "RTRIM", "SCORE", "SECOND", "SIGN", "SIN", "SINH", "SMALLINT", "SOUNDEX", "SPACE", "SQRT", "STRIP", "STRLEFT", "STRPOS", "STRRIGHT", "SUBSTR", "SUBSTRING", "TABLE_NAME", "TABLE_SCHEMA", "TAN", "TANH", "TIME", "TIMESTAMP_FORMAT", "TIMESTAMP_ISO", "TIMESTAMP", "TIMESTAMPDIFF_BIG", "TIMESTAMPDIFF", "TO_CHAR", "TO_CLOB", "TO_DATE", "TO_NUMBER", "TO_TIMESTAMP", "TOTALORDER", "TRANSLATE", "TRIM_ARRAY", "TRIM", "TRUNC_TIMESTAMP", "TRUNC", "TRUNCATE", "UCASE", "UPPER", "URL_DECODE", "URL_ENCODE", "VALUE", "VARBINARY_FORMAT", "VARBINARY", "VARCHAR_BIT_FORMAT", "VARCHAR_FORMAT_BINARY", "VARCHAR_FORMAT", "VARCHAR", "VARGRAPHIC", "VERIFY_GROUP_FOR_USER", "WEEK_ISO", "WEEK", "WRAP", "XMLATTRIBUTES", "XMLCOMMENT", "XMLCONCAT", "XMLDOCUMENT", "XMLELEMENT", "XMLFOREST", "XMLNAMESPACES", "XMLPARSE", "XMLPI", "XMLROW", "XMLSERIALIZE", "XMLTEXT", "XMLVALIDATE", "XOR", "XSLTRANSFORM", "YEAR", "ZONED"],
            table: ["BASE_TABLE", "HTTP_DELETE_BLOB_VERBOSE", "HTTP_DELETE_VERBOSE", "HTTP_GET_BLOB_VERBOSE", "HTTP_GET_VERBOSE", "HTTP_PATCH_BLOB_VERBOSE", "HTTP_PATCH_VERBOSE", "HTTP_POST_BLOB_VERBOSE", "HTTP_POST_VERBOSE", "HTTP_PUT_BLOB_VERBOSE", "HTTP_PUT_VERBOSE", "JSON_TABLE", "MQREADALL", "MQREADALLCLOB", "MQRECEIVEALL", "MQRECEIVEALLCLOB", "XMLTABLE"],
            row: ["UNPACK"],
            olap: ["CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "RANK", "RATIO_TO_REPORT", "ROW_NUMBER"],
            cast: ["CAST"]
        })
          , w = o({
            standard: ["ABSENT", "ACCORDING", "ACCTNG", "ACTION", "ACTIVATE", "ADD", "ALIAS", "ALL", "ALLOCATE", "ALLOW", "ALTER", "AND", "ANY", "APPEND", "APPLNAME", "ARRAY", "ARRAY_AGG", "ARRAY_TRIM", "AS", "ASC", "ASENSITIVE", "ASSOCIATE", "ATOMIC", "ATTACH", "ATTRIBUTES", "AUTHORIZATION", "AUTONOMOUS", "BEFORE", "BEGIN", "BETWEEN", "BINARY", "BIND", "BIT", "BOOLEAN", "BSON", "BUFFERPOOL", "BY", "CACHE", "CALL", "CALLED", "CARDINALITY", "CASE", "CAST", "CCSID", "CHAR", "CHARACTER", "CHECK", "CL", "CLOSE", "CLUSTER", "COLLECT", "COLLECTION", "COLUMN", "COMMENT", "COMMIT", "COMPACT", "COMPARISONS", "COMPRESS", "CONCAT", "CONCURRENT", "CONDITION", "CONNECT", "CONNECT_BY_ROOT", "CONNECTION", "CONSTANT", "CONSTRAINT", "CONTAINS", "CONTENT", "CONTINUE", "COPY", "COUNT", "COUNT_BIG", "CREATE", "CREATEIN", "CROSS", "CUBE", "CUME_DIST", "CURRENT", "CURRENT_DATE", "CURRENT_PATH", "CURRENT_SCHEMA", "CURRENT_SERVER", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_USER", "CURSOR", "CYCLE", "DATA", "DATABASE", "DATAPARTITIONNAME", "DATAPARTITIONNUM", "DATE", "DAY", "DAYS", "DB2GENERAL", "DB2GENRL", "DB2SQL", "DBINFO", "DBPARTITIONNAME", "DBPARTITIONNUM", "DEACTIVATE", "DEALLOCATE", "DECLARE", "DEFAULT", "DEFAULTS", "DEFER", "DEFINE", "DEFINITION", "DELETE", "DELETING", "DENSE_RANK", "DENSERANK", "DESC", "DESCRIBE", "DESCRIPTOR", "DETACH", "DETERMINISTIC", "DIAGNOSTICS", "DISABLE", "DISALLOW", "DISCONNECT", "DISTINCT", "DO", "DOCUMENT", "DOUBLE", "DROP", "DYNAMIC", "EACH", "ELSE", "ELSEIF", "EMPTY", "ENABLE", "ENCODING", "ENCRYPTION", "END", "END-EXEC", "ENDING", "ENFORCED", "ERROR", "ESCAPE", "EVERY", "EXCEPT", "EXCEPTION", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXIT", "EXTEND", "EXTERNAL", "EXTRACT", "FALSE", "FENCED", "FETCH", "FIELDPROC", "FILE", "FINAL", "FIRST_VALUE", "FOR", "FOREIGN", "FORMAT", "FREE", "FREEPAGE", "FROM", "FULL", "FUNCTION", "GBPCACHE", "GENERAL", "GENERATED", "GET", "GLOBAL", "GO", "GOTO", "GRANT", "GRAPHIC", "GROUP", "HANDLER", "HASH", "HASH_ROW", "HASHED_VALUE", "HAVING", "HINT", "HOLD", "HOUR", "HOURS", "IDENTITY", "IF", "IGNORE", "IMMEDIATE", "IMPLICITLY", "IN", "INCLUDE", "INCLUDING", "INCLUSIVE", "INCREMENT", "INDEX", "INDEXBP", "INDICATOR", "INF", "INFINITY", "INHERIT", "INLINE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INSERTING", "INTEGRITY", "INTERPRET", "INTERSECT", "INTO", "IS", "ISNULL", "ISOLATION", "ITERATE", "JAVA", "JOIN", "JSON", "JSON_ARRAY", "JSON_ARRAYAGG", "JSON_EXISTS", "JSON_OBJECT", "JSON_OBJECTAGG", "JSON_QUERY", "JSON_TABLE", "JSON_VALUE", "KEEP", "KEY", "KEYS", "LABEL", "LAG", "LANGUAGE", "LAST_VALUE", "LATERAL", "LEAD", "LEAVE", "LEFT", "LEVEL2", "LIKE", "LIMIT", "LINKTYPE", "LISTAGG", "LOCAL", "LOCALDATE", "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCATOR", "LOCK", "LOCKSIZE", "LOG", "LOGGED", "LONG", "LOOP", "MAINTAINED", "MASK", "MATCHED", "MATERIALIZED", "MAXVALUE", "MERGE", "MICROSECOND", "MICROSECONDS", "MINPCTUSED", "MINUTE", "MINUTES", "MINVALUE", "MIRROR", "MIXED", "MODE", "MODIFIES", "MONTH", "MONTHS", "NAMESPACE", "NAN", "NATIONAL", "NCHAR", "NCLOB", "NESTED", "NEW", "NEW_TABLE", "NEXTVAL", "NO", "NOCACHE", "NOCYCLE", "NODENAME", "NODENUMBER", "NOMAXVALUE", "NOMINVALUE", "NONE", "NOORDER", "NORMALIZED", "NOT", "NOTNULL", "NTH_VALUE", "NTILE", "NULL", "NULLS", "NVARCHAR", "OBID", "OBJECT", "OF", "OFF", "OFFSET", "OLD", "OLD_TABLE", "OMIT", "ON", "ONLY", "OPEN", "OPTIMIZE", "OPTION", "OR", "ORDER", "ORDINALITY", "ORGANIZE", "OUT", "OUTER", "OVER", "OVERLAY", "OVERRIDING", "PACKAGE", "PADDED", "PAGE", "PAGESIZE", "PARAMETER", "PART", "PARTITION", "PARTITIONED", "PARTITIONING", "PARTITIONS", "PASSING", "PASSWORD", "PATH", "PCTFREE", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERIOD", "PERMISSION", "PIECESIZE", "PIPE", "PLAN", "POSITION", "PREPARE", "PREVVAL", "PRIMARY", "PRIOR", "PRIQTY", "PRIVILEGES", "PROCEDURE", "PROGRAM", "PROGRAMID", "QUERY", "RANGE", "RANK", "RATIO_TO_REPORT", "RCDFMT", "READ", "READS", "RECOVERY", "REFERENCES", "REFERENCING", "REFRESH", "REGEXP_LIKE", "RELEASE", "RENAME", "REPEAT", "RESET", "RESIGNAL", "RESTART", "RESULT", "RESULT_SET_LOCATOR", "RETURN", "RETURNING", "RETURNS", "REVOKE", "RID", "RIGHT", "ROLLBACK", "ROLLUP", "ROUTINE", "ROW", "ROW_NUMBER", "ROWNUMBER", "ROWS", "RRN", "RUN", "SAVEPOINT", "SBCS", "SCALAR", "SCHEMA", "SCRATCHPAD", "SCROLL", "SEARCH", "SECOND", "SECONDS", "SECQTY", "SECURED", "SELECT", "SENSITIVE", "SEQUENCE", "SESSION", "SESSION_USER", "SET", "SIGNAL", "SIMPLE", "SKIP", "SNAN", "SOME", "SOURCE", "SPECIFIC", "SQL", "SQLID", "SQLIND_DEFAULT", "SQLIND_UNASSIGNED", "STACKED", "START", "STARTING", "STATEMENT", "STATIC", "STOGROUP", "SUBSTRING", "SUMMARY", "SYNONYM", "SYSTEM_TIME", "SYSTEM_USER", "TABLE", "TABLESPACE", "TABLESPACES", "TAG", "THEN", "THREADSAFE", "TIME", "TIMESTAMP", "TO", "TRANSACTION", "TRANSFER", "TRIGGER", "TRIM", "TRIM_ARRAY", "TRUE", "TRUNCATE", "TRY_CAST", "TYPE", "UNDO", "UNION", "UNIQUE", "UNIT", "UNKNOWN", "UNNEST", "UNTIL", "UPDATE", "UPDATING", "URI", "USAGE", "USE", "USER", "USERID", "USING", "VALUE", "VALUES", "VARIABLE", "VARIANT", "VCAT", "VERSION", "VERSIONING", "VIEW", "VOLATILE", "WAIT", "WHEN", "WHENEVER", "WHERE", "WHILE", "WITH", "WITHIN", "WITHOUT", "WRAPPED", "WRAPPER", "WRITE", "WRKSTNNAME", "XMLAGG", "XMLATTRIBUTES", "XMLCAST", "XMLCOMMENT", "XMLCONCAT", "XMLDOCUMENT", "XMLELEMENT", "XMLFOREST", "XMLGROUP", "XMLNAMESPACES", "XMLPARSE", "XMLPI", "XMLROW", "XMLSERIALIZE", "XMLTABLE", "XMLTEXT", "XMLVALIDATE", "XSLTRANSFORM", "XSROBJECT", "YEAR", "YEARS", "YES", "ZONE"]
        })
          , v = C(["SELECT [ALL | DISTINCT]"])
          , Q = C(["WITH [RECURSIVE]", "INTO", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER [SIBLINGS] BY [INPUT SEQUENCE]", "LIMIT", "OFFSET", "FETCH {FIRST | NEXT}", "FOR UPDATE [OF]", "FOR READ ONLY", "OPTIMIZE FOR", "INSERT INTO", "VALUES", "SET", "MERGE INTO", "WHEN [NOT] MATCHED [THEN]", "UPDATE SET", "DELETE", "INSERT", "CREATE [OR REPLACE] TABLE", "FOR SYSTEM NAME", "CREATE [OR REPLACE] [RECURSIVE] VIEW"])
          , Z = C(["UPDATE", "WHERE CURRENT OF", "WITH {NC | RR | RS | CS | UR}", "DELETE FROM", "DROP TABLE", "ALTER TABLE", "ADD [COLUMN]", "ALTER [COLUMN]", "DROP [COLUMN]", "SET DATA TYPE", "SET {GENERATED ALWAYS | GENERATED BY DEFAULT}", "SET NOT NULL", "SET {NOT HIDDEN | IMPLICITLY HIDDEN}", "SET FIELDPROC", "DROP {DEFAULT | NOT NULL | GENERATED | IDENTITY | ROW CHANGE TIMESTAMP | FIELDPROC}", "TRUNCATE [TABLE]", "SET [CURRENT] SCHEMA", "SET CURRENT_SCHEMA", "ALLOCATE CURSOR", "ALLOCATE [SQL] DESCRIPTOR [LOCAL | GLOBAL] SQL", "ALTER [SPECIFIC] {FUNCTION | PROCEDURE}", "ALTER {MASK | PERMISSION | SEQUENCE | TRIGGER}", "ASSOCIATE [RESULT SET] {LOCATOR | LOCATORS}", "BEGIN DECLARE SECTION", "CALL", "CLOSE", "COMMENT ON {ALIAS | COLUMN | CONSTRAINT | INDEX | MASK | PACKAGE | PARAMETER | PERMISSION | SEQUENCE | TABLE | TRIGGER | VARIABLE | XSROBJECT}", "COMMENT ON [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE}", "COMMENT ON PARAMETER SPECIFIC {FUNCTION | PROCEDURE | ROUTINE}", "COMMENT ON [TABLE FUNCTION] RETURN COLUMN", "COMMENT ON [TABLE FUNCTION] RETURN COLUMN SPECIFIC [PROCEDURE | ROUTINE]", "COMMIT [WORK] [HOLD]", "CONNECT [TO | RESET] USER", "CREATE [OR REPLACE] {ALIAS | FUNCTION | MASK | PERMISSION | PROCEDURE | SEQUENCE | TRIGGER | VARIABLE}", "CREATE [ENCODED VECTOR] INDEX", "CREATE UNIQUE [WHERE NOT NULL] INDEX", "CREATE SCHEMA", "CREATE TYPE", "DEALLOCATE [SQL] DESCRIPTOR [LOCAL | GLOBAL]", "DECLARE CURSOR", "DECLARE GLOBAL TEMPORARY TABLE", "DECLARE", "DESCRIBE CURSOR", "DESCRIBE INPUT", "DESCRIBE [OUTPUT]", "DESCRIBE {PROCEDURE | ROUTINE}", "DESCRIBE TABLE", "DISCONNECT ALL [SQL]", "DISCONNECT [CURRENT]", "DROP {ALIAS | INDEX | MASK | PACKAGE | PERMISSION | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT} [IF EXISTS]", "DROP [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE} [IF EXISTS]", "END DECLARE SECTION", "EXECUTE [IMMEDIATE]", "FREE LOCATOR", "GET [SQL] DESCRIPTOR [LOCAL | GLOBAL]", "GET [CURRENT | STACKED] DIAGNOSTICS", "GRANT {ALL [PRIVILEGES] | ALTER | EXECUTE} ON {FUNCTION | PROCEDURE | ROUTINE | PACKAGE | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT}", "HOLD LOCATOR", "INCLUDE", "LABEL ON {ALIAS | COLUMN | CONSTRAINT | INDEX | MASK | PACKAGE | PERMISSION | SEQUENCE | TABLE | TRIGGER | VARIABLE | XSROBJECT}", "LABEL ON [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE}", "LOCK TABLE", "OPEN", "PREPARE", "REFRESH TABLE", "RELEASE", "RELEASE [TO] SAVEPOINT", "RENAME [TABLE | INDEX] TO", "REVOKE {ALL [PRIVILEGES] | ALTER | EXECUTE} ON {FUNCTION | PROCEDURE | ROUTINE | PACKAGE | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT}", "ROLLBACK [WORK] [HOLD | TO SAVEPOINT]", "SAVEPOINT", "SET CONNECTION", "SET CURRENT {DEBUG MODE | DECFLOAT ROUNDING MODE | DEGREE | IMPLICIT XMLPARSE OPTION | TEMPORAL SYSTEM_TIME}", "SET [SQL] DESCRIPTOR [LOCAL | GLOBAL]", "SET ENCRYPTION PASSWORD", "SET OPTION", "SET {[CURRENT [FUNCTION]] PATH | CURRENT_PATH}", "SET RESULT SETS [WITH RETURN [TO CALLER | TO CLIENT]]", "SET SESSION AUTHORIZATION", "SET SESSION_USER", "SET TRANSACTION", "SIGNAL SQLSTATE [VALUE]", "TAG", "TRANSFER OWNERSHIP OF", "WHENEVER {NOT FOUND | SQLERROR | SQLWARNING}"])
          , q = C(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"])
          , k = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "[LEFT | RIGHT] EXCEPTION JOIN", "{INNER | CROSS} JOIN"])
          , j = C(["ON DELETE", "ON UPDATE", "SET NULL", "{ROWS | RANGE} BETWEEN"])
          , z = {
            name: "db2i",
            tokenizerOptions: {
                reservedSelect: v,
                reservedClauses: [...Q, ...Z],
                reservedSetOperations: q,
                reservedJoins: k,
                reservedPhrases: j,
                reservedKeywords: w,
                reservedFunctionNames: $,
                nestedBlockComments: !0,
                extraParens: ["[]"],
                stringTypes: [{
                    quote: "''-qq",
                    prefixes: ["G", "N"]
                }, {
                    quote: "''-raw",
                    prefixes: ["X", "BX", "GX", "UX"],
                    requirePrefix: !0
                }],
                identTypes: ['""-qq'],
                identChars: {
                    first: "@#$",
                    rest: "@#$"
                },
                paramTypes: {
                    positional: !0,
                    named: [":"]
                },
                paramChars: {
                    first: "@#$",
                    rest: "@#$"
                },
                operators: ["**", "¬=", "¬>", "¬<", "!>", "!<", "||", "=>"]
            },
            formatOptions: {
                onelineClauses: Z
            }
        }
          , EE = o({
            math: ["ABS", "ACOS", "ASIN", "ATAN", "BIN", "BROUND", "CBRT", "CEIL", "CEILING", "CONV", "COS", "DEGREES", "EXP", "FACTORIAL", "FLOOR", "GREATEST", "HEX", "LEAST", "LN", "LOG", "LOG10", "LOG2", "NEGATIVE", "PI", "PMOD", "POSITIVE", "POW", "POWER", "RADIANS", "RAND", "ROUND", "SHIFTLEFT", "SHIFTRIGHT", "SHIFTRIGHTUNSIGNED", "SIGN", "SIN", "SQRT", "TAN", "UNHEX", "WIDTH_BUCKET"],
            array: ["ARRAY_CONTAINS", "MAP_KEYS", "MAP_VALUES", "SIZE", "SORT_ARRAY"],
            conversion: ["BINARY", "CAST"],
            date: ["ADD_MONTHS", "DATE", "DATE_ADD", "DATE_FORMAT", "DATE_SUB", "DATEDIFF", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFYEAR", "EXTRACT", "FROM_UNIXTIME", "FROM_UTC_TIMESTAMP", "HOUR", "LAST_DAY", "MINUTE", "MONTH", "MONTHS_BETWEEN", "NEXT_DAY", "QUARTER", "SECOND", "TIMESTAMP", "TO_DATE", "TO_UTC_TIMESTAMP", "TRUNC", "UNIX_TIMESTAMP", "WEEKOFYEAR", "YEAR"],
            conditional: ["ASSERT_TRUE", "COALESCE", "IF", "ISNOTNULL", "ISNULL", "NULLIF", "NVL"],
            string: ["ASCII", "BASE64", "CHARACTER_LENGTH", "CHR", "CONCAT", "CONCAT_WS", "CONTEXT_NGRAMS", "DECODE", "ELT", "ENCODE", "FIELD", "FIND_IN_SET", "FORMAT_NUMBER", "GET_JSON_OBJECT", "IN_FILE", "INITCAP", "INSTR", "LCASE", "LENGTH", "LEVENSHTEIN", "LOCATE", "LOWER", "LPAD", "LTRIM", "NGRAMS", "OCTET_LENGTH", "PARSE_URL", "PRINTF", "QUOTE", "REGEXP_EXTRACT", "REGEXP_REPLACE", "REPEAT", "REVERSE", "RPAD", "RTRIM", "SENTENCES", "SOUNDEX", "SPACE", "SPLIT", "STR_TO_MAP", "SUBSTR", "SUBSTRING", "TRANSLATE", "TRIM", "UCASE", "UNBASE64", "UPPER"],
            masking: ["MASK", "MASK_FIRST_N", "MASK_HASH", "MASK_LAST_N", "MASK_SHOW_FIRST_N", "MASK_SHOW_LAST_N"],
            misc: ["AES_DECRYPT", "AES_ENCRYPT", "CRC32", "CURRENT_DATABASE", "CURRENT_USER", "HASH", "JAVA_METHOD", "LOGGED_IN_USER", "MD5", "REFLECT", "SHA", "SHA1", "SHA2", "SURROGATE_KEY", "VERSION"],
            aggregate: ["AVG", "COLLECT_LIST", "COLLECT_SET", "CORR", "COUNT", "COVAR_POP", "COVAR_SAMP", "HISTOGRAM_NUMERIC", "MAX", "MIN", "NTILE", "PERCENTILE", "PERCENTILE_APPROX", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "STDDEV_POP", "STDDEV_SAMP", "SUM", "VAR_POP", "VAR_SAMP", "VARIANCE"],
            table: ["EXPLODE", "INLINE", "JSON_TUPLE", "PARSE_URL_TUPLE", "POSEXPLODE", "STACK"],
            window: ["LEAD", "LAG", "FIRST_VALUE", "LAST_VALUE", "RANK", "ROW_NUMBER", "DENSE_RANK", "CUME_DIST", "PERCENT_RANK", "NTILE"],
            dataTypes: ["DECIMAL", "NUMERIC", "VARCHAR", "CHAR"]
        })
          , TE = o({
            nonReserved: ["ADD", "ADMIN", "AFTER", "ANALYZE", "ARCHIVE", "ASC", "BEFORE", "BUCKET", "BUCKETS", "CASCADE", "CHANGE", "CLUSTER", "CLUSTERED", "CLUSTERSTATUS", "COLLECTION", "COLUMNS", "COMMENT", "COMPACT", "COMPACTIONS", "COMPUTE", "CONCATENATE", "CONTINUE", "DATA", "DATABASES", "DATETIME", "DAY", "DBPROPERTIES", "DEFERRED", "DEFINED", "DELIMITED", "DEPENDENCY", "DESC", "DIRECTORIES", "DIRECTORY", "DISABLE", "DISTRIBUTE", "ELEM_TYPE", "ENABLE", "ESCAPED", "EXCLUSIVE", "EXPLAIN", "EXPORT", "FIELDS", "FILE", "FILEFORMAT", "FIRST", "FORMAT", "FORMATTED", "FUNCTIONS", "HOLD_DDLTIME", "HOUR", "IDXPROPERTIES", "IGNORE", "INDEX", "INDEXES", "INPATH", "INPUTDRIVER", "INPUTFORMAT", "ITEMS", "JAR", "KEYS", "KEY_TYPE", "LIMIT", "LINES", "LOAD", "LOCATION", "LOCK", "LOCKS", "LOGICAL", "LONG", "MAPJOIN", "MATERIALIZED", "METADATA", "MINUS", "MINUTE", "MONTH", "MSCK", "NOSCAN", "NO_DROP", "OFFLINE", "OPTION", "OUTPUTDRIVER", "OUTPUTFORMAT", "OVERWRITE", "OWNER", "PARTITIONED", "PARTITIONS", "PLUS", "PRETTY", "PRINCIPALS", "PROTECTION", "PURGE", "READ", "READONLY", "REBUILD", "RECORDREADER", "RECORDWRITER", "RELOAD", "RENAME", "REPAIR", "REPLACE", "REPLICATION", "RESTRICT", "REWRITE", "ROLE", "ROLES", "SCHEMA", "SCHEMAS", "SECOND", "SEMI", "SERDE", "SERDEPROPERTIES", "SERVER", "SETS", "SHARED", "SHOW", "SHOW_DATABASE", "SKEWED", "SORT", "SORTED", "SSL", "STATISTICS", "STORED", "STREAMTABLE", "STRING", "STRUCT", "TABLES", "TBLPROPERTIES", "TEMPORARY", "TERMINATED", "TINYINT", "TOUCH", "TRANSACTIONS", "UNARCHIVE", "UNDO", "UNIONTYPE", "UNLOCK", "UNSET", "UNSIGNED", "URI", "USE", "UTC", "UTCTIMESTAMP", "VALUE_TYPE", "VIEW", "WHILE", "YEAR", "AUTOCOMMIT", "ISOLATION", "LEVEL", "OFFSET", "SNAPSHOT", "TRANSACTION", "WORK", "WRITE", "ABORT", "KEY", "LAST", "NORELY", "NOVALIDATE", "NULLS", "RELY", "VALIDATE", "DETAIL", "DOW", "EXPRESSION", "OPERATOR", "QUARTER", "SUMMARY", "VECTORIZATION", "WEEK", "YEARS", "MONTHS", "WEEKS", "DAYS", "HOURS", "MINUTES", "SECONDS", "TIMESTAMPTZ", "ZONE"],
            reserved: ["ALL", "ALTER", "AND", "ARRAY", "AS", "AUTHORIZATION", "BETWEEN", "BIGINT", "BINARY", "BOOLEAN", "BOTH", "BY", "CASE", "CAST", "CHAR", "COLUMN", "CONF", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_DATE", "CURRENT_TIMESTAMP", "CURSOR", "DATABASE", "DATE", "DECIMAL", "DELETE", "DESCRIBE", "DISTINCT", "DOUBLE", "DROP", "ELSE", "END", "EXCHANGE", "EXISTS", "EXTENDED", "EXTERNAL", "FALSE", "FETCH", "FLOAT", "FOLLOWING", "FOR", "FROM", "FULL", "FUNCTION", "GRANT", "GROUP", "GROUPING", "HAVING", "IF", "IMPORT", "IN", "INNER", "INSERT", "INT", "INTERSECT", "INTERVAL", "INTO", "IS", "JOIN", "LATERAL", "LEFT", "LESS", "LIKE", "LOCAL", "MACRO", "MAP", "MORE", "NONE", "NOT", "NULL", "OF", "ON", "OR", "ORDER", "OUT", "OUTER", "OVER", "PARTIALSCAN", "PARTITION", "PERCENT", "PRECEDING", "PRESERVE", "PROCEDURE", "RANGE", "READS", "REDUCE", "REVOKE", "RIGHT", "ROLLUP", "ROW", "ROWS", "SELECT", "SET", "SMALLINT", "TABLE", "TABLESAMPLE", "THEN", "TIMESTAMP", "TO", "TRANSFORM", "TRIGGER", "TRUE", "TRUNCATE", "UNBOUNDED", "UNION", "UNIQUEJOIN", "UPDATE", "USER", "USING", "UTC_TMESTAMP", "VALUES", "VARCHAR", "WHEN", "WHERE", "WINDOW", "WITH", "COMMIT", "ONLY", "REGEXP", "RLIKE", "ROLLBACK", "START", "CACHE", "CONSTRAINT", "FOREIGN", "PRIMARY", "REFERENCES", "DAYOFWEEK", "EXTRACT", "FLOOR", "INTEGER", "PRECISION", "VIEWS", "TIME", "NUMERIC", "SYNC"],
            fileTypes: ["TEXTFILE", "SEQUENCEFILE", "ORC", "CSV", "TSV", "PARQUET", "AVRO", "RCFILE", "JSONFILE", "INPUTFORMAT", "OUTPUTFORMAT"]
        })
          , RE = C(["SELECT [ALL | DISTINCT]"])
          , AE = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "SORT BY", "CLUSTER BY", "DISTRIBUTE BY", "LIMIT", "INSERT INTO [TABLE]", "VALUES", "SET", "MERGE INTO", "WHEN [NOT] MATCHED [THEN]", "UPDATE SET", "INSERT [VALUES]", "INSERT OVERWRITE [LOCAL] DIRECTORY", "LOAD DATA [LOCAL] INPATH", "[OVERWRITE] INTO TABLE", "CREATE [MATERIALIZED] VIEW [IF NOT EXISTS]", "CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS]"])
          , SE = C(["UPDATE", "DELETE FROM", "DROP TABLE [IF EXISTS]", "ALTER TABLE", "RENAME TO", "TRUNCATE [TABLE]", "ALTER", "CREATE", "USE", "DESCRIBE", "DROP", "FETCH", "SHOW", "STORED AS", "STORED BY", "ROW FORMAT"])
          , NE = C(["UNION [ALL | DISTINCT]"])
          , OE = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "LEFT SEMI JOIN"])
          , IE = C(["{ROWS | RANGE} BETWEEN"])
          , LE = {
            name: "hive",
            tokenizerOptions: {
                reservedSelect: RE,
                reservedClauses: [...AE, ...SE],
                reservedSetOperations: NE,
                reservedJoins: OE,
                reservedPhrases: IE,
                reservedKeywords: TE,
                reservedFunctionNames: EE,
                extraParens: ["[]"],
                stringTypes: ['""-bs', "''-bs"],
                identTypes: ["``"],
                variableTypes: [{
                    quote: "{}",
                    prefixes: ["$"],
                    requirePrefix: !0
                }],
                operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||"]
            },
            formatOptions: {
                onelineClauses: SE
            }
        };
        function CE(T) {
            return T.map(((R,A)=>{
                const S = T[A + 1] || N;
                if (I.SET(R) && "(" === S.text)
                    return Object.assign(Object.assign({}, R), {
                        type: E.RESERVED_FUNCTION_NAME
                    });
                const O = T[A - 1] || N;
                return I.VALUES(R) && "=" === O.text ? Object.assign(Object.assign({}, R), {
                    type: E.RESERVED_FUNCTION_NAME
                }) : R
            }
            ))
        }
        const _E = o({
            reserved: ["ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DELETE_DOMAIN_ID", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DO_DOMAIN_IDS", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "ENCLOSED", "ESCAPED", "EXCEPT", "EXISTS", "EXIT", "EXPLAIN", "FALSE", "FETCH", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM", "FULLTEXT", "GENERAL", "GRANT", "GROUP", "HAVING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IGNORE_DOMAIN_IDS", "IGNORE_SERVER_IDS", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "IS", "ITERATE", "JOIN", "KEY", "KEYS", "KILL", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_HEARTBEAT_PERIOD", "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT", "NO_WRITE_TO_BINLOG", "NULL", "NUMERIC", "OFFSET", "ON", "OPTIMIZE", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "OVER", "PAGE_CHECKSUM", "PARSE_VCOL_EXPR", "PARTITION", "POSITION", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "READ", "READS", "READ_WRITE", "REAL", "RECURSIVE", "REF_SYSTEM_ID", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "RETURNING", "REVOKE", "RIGHT", "RLIKE", "ROW_NUMBER", "ROWS", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SLOW", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING", "STATS_AUTO_RECALC", "STATS_PERSISTENT", "STATS_SAMPLE_PAGES", "STRAIGHT_JOIN", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL"]
        })
          , eE = o({
            all: ["ADDDATE", "ADD_MONTHS", "BIT_AND", "BIT_OR", "BIT_XOR", "CAST", "COUNT", "CUME_DIST", "CURDATE", "CURTIME", "DATE_ADD", "DATE_SUB", "DATE_FORMAT", "DECODE", "DENSE_RANK", "EXTRACT", "FIRST_VALUE", "GROUP_CONCAT", "JSON_ARRAYAGG", "JSON_OBJECTAGG", "LAG", "LEAD", "MAX", "MEDIAN", "MID", "MIN", "NOW", "NTH_VALUE", "NTILE", "POSITION", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "RANK", "ROW_NUMBER", "SESSION_USER", "STD", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUBDATE", "SUBSTR", "SUBSTRING", "SUM", "SYSTEM_USER", "TRIM", "TRIM_ORACLE", "VARIANCE", "VAR_POP", "VAR_SAMP", "ABS", "ACOS", "ADDTIME", "AES_DECRYPT", "AES_ENCRYPT", "ASIN", "ATAN", "ATAN2", "BENCHMARK", "BIN", "BINLOG_GTID_POS", "BIT_COUNT", "BIT_LENGTH", "CEIL", "CEILING", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHR", "COERCIBILITY", "COLUMN_CHECK", "COLUMN_EXISTS", "COLUMN_LIST", "COLUMN_JSON", "COMPRESS", "CONCAT", "CONCAT_OPERATOR_ORACLE", "CONCAT_WS", "CONNECTION_ID", "CONV", "CONVERT_TZ", "COS", "COT", "CRC32", "DATEDIFF", "DAYNAME", "DAYOFMONTH", "DAYOFWEEK", "DAYOFYEAR", "DEGREES", "DECODE_HISTOGRAM", "DECODE_ORACLE", "DES_DECRYPT", "DES_ENCRYPT", "ELT", "ENCODE", "ENCRYPT", "EXP", "EXPORT_SET", "EXTRACTVALUE", "FIELD", "FIND_IN_SET", "FLOOR", "FORMAT", "FOUND_ROWS", "FROM_BASE64", "FROM_DAYS", "FROM_UNIXTIME", "GET_LOCK", "GREATEST", "HEX", "IFNULL", "INSTR", "ISNULL", "IS_FREE_LOCK", "IS_USED_LOCK", "JSON_ARRAY", "JSON_ARRAY_APPEND", "JSON_ARRAY_INSERT", "JSON_COMPACT", "JSON_CONTAINS", "JSON_CONTAINS_PATH", "JSON_DEPTH", "JSON_DETAILED", "JSON_EXISTS", "JSON_EXTRACT", "JSON_INSERT", "JSON_KEYS", "JSON_LENGTH", "JSON_LOOSE", "JSON_MERGE", "JSON_MERGE_PATCH", "JSON_MERGE_PRESERVE", "JSON_QUERY", "JSON_QUOTE", "JSON_OBJECT", "JSON_REMOVE", "JSON_REPLACE", "JSON_SET", "JSON_SEARCH", "JSON_TYPE", "JSON_UNQUOTE", "JSON_VALID", "JSON_VALUE", "LAST_DAY", "LAST_INSERT_ID", "LCASE", "LEAST", "LENGTH", "LENGTHB", "LN", "LOAD_FILE", "LOCATE", "LOG", "LOG10", "LOG2", "LOWER", "LPAD", "LPAD_ORACLE", "LTRIM", "LTRIM_ORACLE", "MAKEDATE", "MAKETIME", "MAKE_SET", "MASTER_GTID_WAIT", "MASTER_POS_WAIT", "MD5", "MONTHNAME", "NAME_CONST", "NVL", "NVL2", "OCT", "OCTET_LENGTH", "ORD", "PERIOD_ADD", "PERIOD_DIFF", "PI", "POW", "POWER", "QUOTE", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "RADIANS", "RAND", "RELEASE_ALL_LOCKS", "RELEASE_LOCK", "REPLACE_ORACLE", "REVERSE", "ROUND", "RPAD", "RPAD_ORACLE", "RTRIM", "RTRIM_ORACLE", "SEC_TO_TIME", "SHA", "SHA1", "SHA2", "SIGN", "SIN", "SLEEP", "SOUNDEX", "SPACE", "SQRT", "STRCMP", "STR_TO_DATE", "SUBSTR_ORACLE", "SUBSTRING_INDEX", "SUBTIME", "SYS_GUID", "TAN", "TIMEDIFF", "TIME_FORMAT", "TIME_TO_SEC", "TO_BASE64", "TO_CHAR", "TO_DAYS", "TO_SECONDS", "UCASE", "UNCOMPRESS", "UNCOMPRESSED_LENGTH", "UNHEX", "UNIX_TIMESTAMP", "UPDATEXML", "UPPER", "UUID", "UUID_SHORT", "VERSION", "WEEKDAY", "WEEKOFYEAR", "WSREP_LAST_WRITTEN_GTID", "WSREP_LAST_SEEN_GTID", "WSREP_SYNC_WAIT_UPTO_GTID", "YEARWEEK", "COALESCE", "NULLIF", "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "INTEGER", "BIGINT", "DECIMAL", "DEC", "NUMERIC", "FIXED", "FLOAT", "DOUBLE", "DOUBLE PRECISION", "REAL", "BIT", "BINARY", "BLOB", "CHAR", "NATIONAL CHAR", "CHAR BYTE", "ENUM", "VARBINARY", "VARCHAR", "NATIONAL VARCHAR", "TIME", "DATETIME", "TIMESTAMP", "YEAR"]
        })
          , PE = C(["SELECT [ALL | DISTINCT | DISTINCTROW]"])
          , DE = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "FETCH {FIRST | NEXT}", "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]", "REPLACE [LOW_PRIORITY | DELAYED] [INTO]", "VALUES", "ON DUPLICATE KEY UPDATE", "SET", "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]", "CREATE [OR REPLACE] [TEMPORARY] TABLE [IF NOT EXISTS]", "RETURNING"])
          , sE = C(["UPDATE [LOW_PRIORITY] [IGNORE]", "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM", "DROP [TEMPORARY] TABLE [IF EXISTS]", "ALTER [ONLINE] [IGNORE] TABLE [IF EXISTS]", "ADD [COLUMN] [IF NOT EXISTS]", "{CHANGE | MODIFY} [COLUMN] [IF EXISTS]", "DROP [COLUMN] [IF EXISTS]", "RENAME [TO]", "RENAME COLUMN", "ALTER [COLUMN]", "{SET | DROP} DEFAULT", "SET {VISIBLE | INVISIBLE}", "TRUNCATE [TABLE]", "ALTER DATABASE", "ALTER DATABASE COMMENT", "ALTER EVENT", "ALTER FUNCTION", "ALTER PROCEDURE", "ALTER SCHEMA", "ALTER SCHEMA COMMENT", "ALTER SEQUENCE", "ALTER SERVER", "ALTER USER", "ALTER VIEW", "ANALYZE", "ANALYZE TABLE", "BACKUP LOCK", "BACKUP STAGE", "BACKUP UNLOCK", "BEGIN", "BINLOG", "CACHE INDEX", "CALL", "CHANGE MASTER TO", "CHECK TABLE", "CHECK VIEW", "CHECKSUM TABLE", "COMMIT", "CREATE AGGREGATE FUNCTION", "CREATE DATABASE", "CREATE EVENT", "CREATE FUNCTION", "CREATE INDEX", "CREATE PROCEDURE", "CREATE ROLE", "CREATE SEQUENCE", "CREATE SERVER", "CREATE SPATIAL INDEX", "CREATE TRIGGER", "CREATE UNIQUE INDEX", "CREATE USER", "DEALLOCATE PREPARE", "DESCRIBE", "DROP DATABASE", "DROP EVENT", "DROP FUNCTION", "DROP INDEX", "DROP PREPARE", "DROP PROCEDURE", "DROP ROLE", "DROP SEQUENCE", "DROP SERVER", "DROP TRIGGER", "DROP USER", "DROP VIEW", "EXECUTE", "EXPLAIN", "FLUSH", "GET DIAGNOSTICS", "GET DIAGNOSTICS CONDITION", "GRANT", "HANDLER", "HELP", "INSTALL PLUGIN", "INSTALL SONAME", "KILL", "LOAD DATA INFILE", "LOAD INDEX INTO CACHE", "LOAD XML INFILE", "LOCK TABLE", "OPTIMIZE TABLE", "PREPARE", "PURGE BINARY LOGS", "PURGE MASTER LOGS", "RELEASE SAVEPOINT", "RENAME TABLE", "RENAME USER", "REPAIR TABLE", "REPAIR VIEW", "RESET MASTER", "RESET QUERY CACHE", "RESET REPLICA", "RESET SLAVE", "RESIGNAL", "REVOKE", "ROLLBACK", "SAVEPOINT", "SET CHARACTER SET", "SET DEFAULT ROLE", "SET GLOBAL TRANSACTION", "SET NAMES", "SET PASSWORD", "SET ROLE", "SET STATEMENT", "SET TRANSACTION", "SHOW", "SHOW ALL REPLICAS STATUS", "SHOW ALL SLAVES STATUS", "SHOW AUTHORS", "SHOW BINARY LOGS", "SHOW BINLOG EVENTS", "SHOW BINLOG STATUS", "SHOW CHARACTER SET", "SHOW CLIENT_STATISTICS", "SHOW COLLATION", "SHOW COLUMNS", "SHOW CONTRIBUTORS", "SHOW CREATE DATABASE", "SHOW CREATE EVENT", "SHOW CREATE FUNCTION", "SHOW CREATE PACKAGE", "SHOW CREATE PACKAGE BODY", "SHOW CREATE PROCEDURE", "SHOW CREATE SEQUENCE", "SHOW CREATE TABLE", "SHOW CREATE TRIGGER", "SHOW CREATE USER", "SHOW CREATE VIEW", "SHOW DATABASES", "SHOW ENGINE", "SHOW ENGINE INNODB STATUS", "SHOW ENGINES", "SHOW ERRORS", "SHOW EVENTS", "SHOW EXPLAIN", "SHOW FUNCTION CODE", "SHOW FUNCTION STATUS", "SHOW GRANTS", "SHOW INDEX", "SHOW INDEXES", "SHOW INDEX_STATISTICS", "SHOW KEYS", "SHOW LOCALES", "SHOW MASTER LOGS", "SHOW MASTER STATUS", "SHOW OPEN TABLES", "SHOW PACKAGE BODY CODE", "SHOW PACKAGE BODY STATUS", "SHOW PACKAGE STATUS", "SHOW PLUGINS", "SHOW PLUGINS SONAME", "SHOW PRIVILEGES", "SHOW PROCEDURE CODE", "SHOW PROCEDURE STATUS", "SHOW PROCESSLIST", "SHOW PROFILE", "SHOW PROFILES", "SHOW QUERY_RESPONSE_TIME", "SHOW RELAYLOG EVENTS", "SHOW REPLICA", "SHOW REPLICA HOSTS", "SHOW REPLICA STATUS", "SHOW SCHEMAS", "SHOW SLAVE", "SHOW SLAVE HOSTS", "SHOW SLAVE STATUS", "SHOW STATUS", "SHOW STORAGE ENGINES", "SHOW TABLE STATUS", "SHOW TABLES", "SHOW TRIGGERS", "SHOW USER_STATISTICS", "SHOW VARIABLES", "SHOW WARNINGS", "SHOW WSREP_MEMBERSHIP", "SHOW WSREP_STATUS", "SHUTDOWN", "SIGNAL", "START ALL REPLICAS", "START ALL SLAVES", "START REPLICA", "START SLAVE", "START TRANSACTION", "STOP ALL REPLICAS", "STOP ALL SLAVES", "STOP REPLICA", "STOP SLAVE", "UNINSTALL PLUGIN", "UNINSTALL SONAME", "UNLOCK TABLE", "USE", "XA BEGIN", "XA COMMIT", "XA END", "XA PREPARE", "XA RECOVER", "XA ROLLBACK", "XA START"])
          , ME = C(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]", "MINUS [ALL | DISTINCT]"])
          , UE = C(["JOIN", "{LEFT | RIGHT} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL JOIN", "NATURAL {LEFT | RIGHT} [OUTER] JOIN", "STRAIGHT_JOIN"])
          , tE = C(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"])
          , rE = {
            name: "mariadb",
            tokenizerOptions: {
                reservedSelect: PE,
                reservedClauses: [...DE, ...sE],
                reservedSetOperations: ME,
                reservedJoins: UE,
                reservedPhrases: tE,
                supportsXor: !0,
                reservedKeywords: _E,
                reservedFunctionNames: eE,
                stringTypes: ['""-qq-bs', "''-qq-bs", {
                    quote: "''-raw",
                    prefixes: ["B", "X"],
                    requirePrefix: !0
                }],
                identTypes: ["``"],
                identChars: {
                    first: "$",
                    rest: "$",
                    allowFirstCharNumber: !0
                },
                variableTypes: [{
                    regex: "@@?[A-Za-z0-9_.$]+"
                }, {
                    quote: '""-qq-bs',
                    prefixes: ["@"],
                    requirePrefix: !0
                }, {
                    quote: "''-qq-bs",
                    prefixes: ["@"],
                    requirePrefix: !0
                }, {
                    quote: "``",
                    prefixes: ["@"],
                    requirePrefix: !0
                }],
                paramTypes: {
                    positional: !0
                },
                lineCommentTypes: ["--", "#"],
                operators: ["%", ":=", "&", "|", "^", "~", "<<", ">>", "<=>", "&&", "||", "!"],
                postProcess: CE
            },
            formatOptions: {
                onelineClauses: sE
            }
        }
          , GE = o({
            reserved: ["ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CUBE", "CUME_DIST", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DENSE_RANK", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "EMPTY", "ENCLOSED", "ESCAPED", "EXCEPT", "EXISTS", "EXIT", "EXPLAIN", "FALSE", "FETCH", "FIRST_VALUE", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM", "FULLTEXT", "FUNCTION", "GENERATED", "GET", "GRANT", "GROUP", "GROUPING", "GROUPS", "HAVING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "IN", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "IO_AFTER_GTIDS", "IO_BEFORE_GTIDS", "IS", "ITERATE", "JOIN", "JSON_TABLE", "KEY", "KEYS", "KILL", "LAG", "LAST_VALUE", "LATERAL", "LEAD", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_BIND", "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT", "NO_WRITE_TO_BINLOG", "NTH_VALUE", "NTILE", "NULL", "NUMERIC", "OF", "ON", "OPTIMIZE", "OPTIMIZER_COSTS", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "OVER", "PARTITION", "PERCENT_RANK", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "RANK", "READ", "READS", "READ_WRITE", "REAL", "RECURSIVE", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RLIKE", "ROW", "ROWS", "ROW_NUMBER", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING", "STORED", "STRAIGHT_JOIN", "SYSTEM", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "VIRTUAL", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL"]
        })
          , nE = o({
            all: ["ABS", "ACOS", "ADDDATE", "ADDTIME", "AES_DECRYPT", "AES_ENCRYPT", "ANY_VALUE", "ASCII", "ASIN", "ATAN", "ATAN2", "AVG", "BENCHMARK", "BIN", "BIN_TO_UUID", "BINARY", "BIT_AND", "BIT_COUNT", "BIT_LENGTH", "BIT_OR", "BIT_XOR", "CAN_ACCESS_COLUMN", "CAN_ACCESS_DATABASE", "CAN_ACCESS_TABLE", "CAN_ACCESS_USER", "CAN_ACCESS_VIEW", "CAST", "CEIL", "CEILING", "CHAR", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHARSET", "COALESCE", "COERCIBILITY", "COLLATION", "COMPRESS", "CONCAT", "CONCAT_WS", "CONNECTION_ID", "CONV", "CONVERT", "CONVERT_TZ", "COS", "COT", "COUNT", "CRC32", "CUME_DIST", "CURDATE", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURTIME", "DATABASE", "DATE", "DATE_ADD", "DATE_FORMAT", "DATE_SUB", "DATEDIFF", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFWEEK", "DAYOFYEAR", "DEFAULT", "DEGREES", "DENSE_RANK", "DIV", "ELT", "EXP", "EXPORT_SET", "EXTRACT", "EXTRACTVALUE", "FIELD", "FIND_IN_SET", "FIRST_VALUE", "FLOOR", "FORMAT", "FORMAT_BYTES", "FORMAT_PICO_TIME", "FOUND_ROWS", "FROM_BASE64", "FROM_DAYS", "FROM_UNIXTIME", "GEOMCOLLECTION", "GEOMETRYCOLLECTION", "GET_DD_COLUMN_PRIVILEGES", "GET_DD_CREATE_OPTIONS", "GET_DD_INDEX_SUB_PART_LENGTH", "GET_FORMAT", "GET_LOCK", "GREATEST", "GROUP_CONCAT", "GROUPING", "GTID_SUBSET", "GTID_SUBTRACT", "HEX", "HOUR", "ICU_VERSION", "IF", "IFNULL", "INET_ATON", "INET_NTOA", "INET6_ATON", "INET6_NTOA", "INSERT", "INSTR", "INTERNAL_AUTO_INCREMENT", "INTERNAL_AVG_ROW_LENGTH", "INTERNAL_CHECK_TIME", "INTERNAL_CHECKSUM", "INTERNAL_DATA_FREE", "INTERNAL_DATA_LENGTH", "INTERNAL_DD_CHAR_LENGTH", "INTERNAL_GET_COMMENT_OR_ERROR", "INTERNAL_GET_ENABLED_ROLE_JSON", "INTERNAL_GET_HOSTNAME", "INTERNAL_GET_USERNAME", "INTERNAL_GET_VIEW_WARNING_OR_ERROR", "INTERNAL_INDEX_COLUMN_CARDINALITY", "INTERNAL_INDEX_LENGTH", "INTERNAL_IS_ENABLED_ROLE", "INTERNAL_IS_MANDATORY_ROLE", "INTERNAL_KEYS_DISABLED", "INTERNAL_MAX_DATA_LENGTH", "INTERNAL_TABLE_ROWS", "INTERNAL_UPDATE_TIME", "INTERVAL", "IS", "IS_FREE_LOCK", "IS_IPV4", "IS_IPV4_COMPAT", "IS_IPV4_MAPPED", "IS_IPV6", "IS NOT", "IS NOT NULL", "IS NULL", "IS_USED_LOCK", "IS_UUID", "ISNULL", "JSON_ARRAY", "JSON_ARRAY_APPEND", "JSON_ARRAY_INSERT", "JSON_ARRAYAGG", "JSON_CONTAINS", "JSON_CONTAINS_PATH", "JSON_DEPTH", "JSON_EXTRACT", "JSON_INSERT", "JSON_KEYS", "JSON_LENGTH", "JSON_MERGE", "JSON_MERGE_PATCH", "JSON_MERGE_PRESERVE", "JSON_OBJECT", "JSON_OBJECTAGG", "JSON_OVERLAPS", "JSON_PRETTY", "JSON_QUOTE", "JSON_REMOVE", "JSON_REPLACE", "JSON_SCHEMA_VALID", "JSON_SCHEMA_VALIDATION_REPORT", "JSON_SEARCH", "JSON_SET", "JSON_STORAGE_FREE", "JSON_STORAGE_SIZE", "JSON_TABLE", "JSON_TYPE", "JSON_UNQUOTE", "JSON_VALID", "JSON_VALUE", "LAG", "LAST_DAY", "LAST_INSERT_ID", "LAST_VALUE", "LCASE", "LEAD", "LEAST", "LEFT", "LENGTH", "LIKE", "LINESTRING", "LN", "LOAD_FILE", "LOCALTIME", "LOCALTIMESTAMP", "LOCATE", "LOG", "LOG10", "LOG2", "LOWER", "LPAD", "LTRIM", "MAKE_SET", "MAKEDATE", "MAKETIME", "MASTER_POS_WAIT", "MATCH", "MAX", "MBRCONTAINS", "MBRCOVEREDBY", "MBRCOVERS", "MBRDISJOINT", "MBREQUALS", "MBRINTERSECTS", "MBROVERLAPS", "MBRTOUCHES", "MBRWITHIN", "MD5", "MEMBER OF", "MICROSECOND", "MID", "MIN", "MINUTE", "MOD", "MONTH", "MONTHNAME", "MULTILINESTRING", "MULTIPOINT", "MULTIPOLYGON", "NAME_CONST", "NOT", "NOT IN", "NOT LIKE", "NOT REGEXP", "NOW", "NTH_VALUE", "NTILE", "NULLIF", "OCT", "OCTET_LENGTH", "ORD", "PERCENT_RANK", "PERIOD_ADD", "PERIOD_DIFF", "PI", "POINT", "POLYGON", "POSITION", "POW", "POWER", "PS_CURRENT_THREAD_ID", "PS_THREAD_ID", "QUARTER", "QUOTE", "RADIANS", "RAND", "RANDOM_BYTES", "RANK", "REGEXP", "REGEXP_INSTR", "REGEXP_LIKE", "REGEXP_REPLACE", "REGEXP_SUBSTR", "RELEASE_ALL_LOCKS", "RELEASE_LOCK", "REPEAT", "REPLACE", "REVERSE", "RIGHT", "RLIKE", "ROLES_GRAPHML", "ROUND", "ROW_COUNT", "ROW_NUMBER", "RPAD", "RTRIM", "SCHEMA", "SEC_TO_TIME", "SECOND", "SESSION_USER", "SHA1", "SHA2", "SIGN", "SIN", "SLEEP", "SOUNDEX", "SOUNDS LIKE", "SOURCE_POS_WAIT", "SPACE", "SQRT", "ST_AREA", "ST_ASBINARY", "ST_ASGEOJSON", "ST_ASTEXT", "ST_BUFFER", "ST_BUFFER_STRATEGY", "ST_CENTROID", "ST_COLLECT", "ST_CONTAINS", "ST_CONVEXHULL", "ST_CROSSES", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_DISTANCE_SPHERE", "ST_ENDPOINT", "ST_ENVELOPE", "ST_EQUALS", "ST_EXTERIORRING", "ST_FRECHETDISTANCE", "ST_GEOHASH", "ST_GEOMCOLLFROMTEXT", "ST_GEOMCOLLFROMWKB", "ST_GEOMETRYN", "ST_GEOMETRYTYPE", "ST_GEOMFROMGEOJSON", "ST_GEOMFROMTEXT", "ST_GEOMFROMWKB", "ST_HAUSDORFFDISTANCE", "ST_INTERIORRINGN", "ST_INTERSECTION", "ST_INTERSECTS", "ST_ISCLOSED", "ST_ISEMPTY", "ST_ISSIMPLE", "ST_ISVALID", "ST_LATFROMGEOHASH", "ST_LATITUDE", "ST_LENGTH", "ST_LINEFROMTEXT", "ST_LINEFROMWKB", "ST_LINEINTERPOLATEPOINT", "ST_LINEINTERPOLATEPOINTS", "ST_LONGFROMGEOHASH", "ST_LONGITUDE", "ST_MAKEENVELOPE", "ST_MLINEFROMTEXT", "ST_MLINEFROMWKB", "ST_MPOINTFROMTEXT", "ST_MPOINTFROMWKB", "ST_MPOLYFROMTEXT", "ST_MPOLYFROMWKB", "ST_NUMGEOMETRIES", "ST_NUMINTERIORRING", "ST_NUMPOINTS", "ST_OVERLAPS", "ST_POINTATDISTANCE", "ST_POINTFROMGEOHASH", "ST_POINTFROMTEXT", "ST_POINTFROMWKB", "ST_POINTN", "ST_POLYFROMTEXT", "ST_POLYFROMWKB", "ST_SIMPLIFY", "ST_SRID", "ST_STARTPOINT", "ST_SWAPXY", "ST_SYMDIFFERENCE", "ST_TOUCHES", "ST_TRANSFORM", "ST_UNION", "ST_VALIDATE", "ST_WITHIN", "ST_X", "ST_Y", "STATEMENT_DIGEST", "STATEMENT_DIGEST_TEXT", "STD", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STR_TO_DATE", "STRCMP", "SUBDATE", "SUBSTR", "SUBSTRING", "SUBSTRING_INDEX", "SUBTIME", "SUM", "SYSDATE", "SYSTEM_USER", "TAN", "TIME", "TIME_FORMAT", "TIME_TO_SEC", "TIMEDIFF", "TIMESTAMP", "TIMESTAMPADD", "TIMESTAMPDIFF", "TO_BASE64", "TO_DAYS", "TO_SECONDS", "TRIM", "TRUNCATE", "UCASE", "UNCOMPRESS", "UNCOMPRESSED_LENGTH", "UNHEX", "UNIX_TIMESTAMP", "UPDATEXML", "UPPER", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "UUID", "UUID_SHORT", "UUID_TO_BIN", "VALIDATE_PASSWORD_STRENGTH", "VALUES", "VAR_POP", "VAR_SAMP", "VARIANCE", "VERSION", "WAIT_FOR_EXECUTED_GTID_SET", "WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS", "WEEK", "WEEKDAY", "WEEKOFYEAR", "WEIGHT_STRING", "YEAR", "YEARWEEK", "BIT", "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "INTEGER", "BIGINT", "DECIMAL", "DEC", "NUMERIC", "FIXED", "FLOAT", "DOUBLE", "DOUBLE PRECISION", "REAL", "DATETIME", "TIMESTAMP", "TIME", "YEAR", "CHAR", "NATIONAL CHAR", "VARCHAR", "NATIONAL VARCHAR", "BINARY", "VARBINARY", "BLOB", "TEXT", "ENUM"]
        })
          , iE = C(["SELECT [ALL | DISTINCT | DISTINCTROW]"])
          , aE = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]", "REPLACE [LOW_PRIORITY | DELAYED] [INTO]", "VALUES", "ON DUPLICATE KEY UPDATE", "SET", "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]", "CREATE [TEMPORARY] TABLE [IF NOT EXISTS]"])
          , oE = C(["UPDATE [LOW_PRIORITY] [IGNORE]", "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM", "DROP [TEMPORARY] TABLE [IF EXISTS]", "ALTER TABLE", "ADD [COLUMN]", "{CHANGE | MODIFY} [COLUMN]", "DROP [COLUMN]", "RENAME [TO | AS]", "RENAME COLUMN", "ALTER [COLUMN]", "{SET | DROP} DEFAULT", "TRUNCATE [TABLE]", "ALTER DATABASE", "ALTER EVENT", "ALTER FUNCTION", "ALTER INSTANCE", "ALTER LOGFILE GROUP", "ALTER PROCEDURE", "ALTER RESOURCE GROUP", "ALTER SERVER", "ALTER TABLESPACE", "ALTER USER", "ALTER VIEW", "ANALYZE TABLE", "BINLOG", "CACHE INDEX", "CALL", "CHANGE MASTER TO", "CHANGE REPLICATION FILTER", "CHANGE REPLICATION SOURCE TO", "CHECK TABLE", "CHECKSUM TABLE", "CLONE", "COMMIT", "CREATE DATABASE", "CREATE EVENT", "CREATE FUNCTION", "CREATE FUNCTION", "CREATE INDEX", "CREATE LOGFILE GROUP", "CREATE PROCEDURE", "CREATE RESOURCE GROUP", "CREATE ROLE", "CREATE SERVER", "CREATE SPATIAL REFERENCE SYSTEM", "CREATE TABLESPACE", "CREATE TRIGGER", "CREATE USER", "DEALLOCATE PREPARE", "DESCRIBE", "DROP DATABASE", "DROP EVENT", "DROP FUNCTION", "DROP FUNCTION", "DROP INDEX", "DROP LOGFILE GROUP", "DROP PROCEDURE", "DROP RESOURCE GROUP", "DROP ROLE", "DROP SERVER", "DROP SPATIAL REFERENCE SYSTEM", "DROP TABLESPACE", "DROP TRIGGER", "DROP USER", "DROP VIEW", "EXECUTE", "EXPLAIN", "FLUSH", "GRANT", "HANDLER", "HELP", "IMPORT TABLE", "INSTALL COMPONENT", "INSTALL PLUGIN", "KILL", "LOAD DATA", "LOAD INDEX INTO CACHE", "LOAD XML", "LOCK INSTANCE FOR BACKUP", "LOCK TABLES", "MASTER_POS_WAIT", "OPTIMIZE TABLE", "PREPARE", "PURGE BINARY LOGS", "RELEASE SAVEPOINT", "RENAME TABLE", "RENAME USER", "REPAIR TABLE", "RESET", "RESET MASTER", "RESET PERSIST", "RESET REPLICA", "RESET SLAVE", "RESTART", "REVOKE", "ROLLBACK", "ROLLBACK TO SAVEPOINT", "SAVEPOINT", "SET CHARACTER SET", "SET DEFAULT ROLE", "SET NAMES", "SET PASSWORD", "SET RESOURCE GROUP", "SET ROLE", "SET TRANSACTION", "SHOW", "SHOW BINARY LOGS", "SHOW BINLOG EVENTS", "SHOW CHARACTER SET", "SHOW COLLATION", "SHOW COLUMNS", "SHOW CREATE DATABASE", "SHOW CREATE EVENT", "SHOW CREATE FUNCTION", "SHOW CREATE PROCEDURE", "SHOW CREATE TABLE", "SHOW CREATE TRIGGER", "SHOW CREATE USER", "SHOW CREATE VIEW", "SHOW DATABASES", "SHOW ENGINE", "SHOW ENGINES", "SHOW ERRORS", "SHOW EVENTS", "SHOW FUNCTION CODE", "SHOW FUNCTION STATUS", "SHOW GRANTS", "SHOW INDEX", "SHOW MASTER STATUS", "SHOW OPEN TABLES", "SHOW PLUGINS", "SHOW PRIVILEGES", "SHOW PROCEDURE CODE", "SHOW PROCEDURE STATUS", "SHOW PROCESSLIST", "SHOW PROFILE", "SHOW PROFILES", "SHOW RELAYLOG EVENTS", "SHOW REPLICA STATUS", "SHOW REPLICAS", "SHOW SLAVE", "SHOW SLAVE HOSTS", "SHOW STATUS", "SHOW TABLE STATUS", "SHOW TABLES", "SHOW TRIGGERS", "SHOW VARIABLES", "SHOW WARNINGS", "SHUTDOWN", "SOURCE_POS_WAIT", "START GROUP_REPLICATION", "START REPLICA", "START SLAVE", "START TRANSACTION", "STOP GROUP_REPLICATION", "STOP REPLICA", "STOP SLAVE", "TABLE", "UNINSTALL COMPONENT", "UNINSTALL PLUGIN", "UNLOCK INSTANCE", "UNLOCK TABLES", "USE", "XA", "ITERATE", "LEAVE", "LOOP", "REPEAT", "RETURN", "WHILE"])
          , HE = C(["UNION [ALL | DISTINCT]"])
          , BE = C(["JOIN", "{LEFT | RIGHT} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT} [OUTER] JOIN", "STRAIGHT_JOIN"])
          , FE = C(["ON {UPDATE | DELETE} [SET NULL]", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"])
          , YE = {
            name: "mysql",
            tokenizerOptions: {
                reservedSelect: iE,
                reservedClauses: [...aE, ...oE],
                reservedSetOperations: HE,
                reservedJoins: BE,
                reservedPhrases: FE,
                supportsXor: !0,
                reservedKeywords: GE,
                reservedFunctionNames: nE,
                stringTypes: ['""-qq-bs', {
                    quote: "''-qq-bs",
                    prefixes: ["N"]
                }, {
                    quote: "''-raw",
                    prefixes: ["B", "X"],
                    requirePrefix: !0
                }],
                identTypes: ["``"],
                identChars: {
                    first: "$",
                    rest: "$",
                    allowFirstCharNumber: !0
                },
                variableTypes: [{
                    regex: "@@?[A-Za-z0-9_.$]+"
                }, {
                    quote: '""-qq-bs',
                    prefixes: ["@"],
                    requirePrefix: !0
                }, {
                    quote: "''-qq-bs",
                    prefixes: ["@"],
                    requirePrefix: !0
                }, {
                    quote: "``",
                    prefixes: ["@"],
                    requirePrefix: !0
                }],
                paramTypes: {
                    positional: !0
                },
                lineCommentTypes: ["--", "#"],
                operators: ["%", ":=", "&", "|", "^", "~", "<<", ">>", "<=>", "->", "->>", "&&", "||", "!"],
                postProcess: CE
            },
            formatOptions: {
                onelineClauses: oE
            }
        }
          , lE = o({
            all: ["ABORT", "ABS", "ACOS", "ADVISOR", "ARRAY_AGG", "ARRAY_AGG", "ARRAY_APPEND", "ARRAY_AVG", "ARRAY_BINARY_SEARCH", "ARRAY_CONCAT", "ARRAY_CONTAINS", "ARRAY_COUNT", "ARRAY_DISTINCT", "ARRAY_EXCEPT", "ARRAY_FLATTEN", "ARRAY_IFNULL", "ARRAY_INSERT", "ARRAY_INTERSECT", "ARRAY_LENGTH", "ARRAY_MAX", "ARRAY_MIN", "ARRAY_MOVE", "ARRAY_POSITION", "ARRAY_PREPEND", "ARRAY_PUT", "ARRAY_RANGE", "ARRAY_REMOVE", "ARRAY_REPEAT", "ARRAY_REPLACE", "ARRAY_REVERSE", "ARRAY_SORT", "ARRAY_STAR", "ARRAY_SUM", "ARRAY_SYMDIFF", "ARRAY_SYMDIFF1", "ARRAY_SYMDIFFN", "ARRAY_UNION", "ASIN", "ATAN", "ATAN2", "AVG", "BASE64", "BASE64_DECODE", "BASE64_ENCODE", "BITAND ", "BITCLEAR ", "BITNOT ", "BITOR ", "BITSET ", "BITSHIFT ", "BITTEST ", "BITXOR ", "CEIL", "CLOCK_LOCAL", "CLOCK_MILLIS", "CLOCK_STR", "CLOCK_TZ", "CLOCK_UTC", "COALESCE", "CONCAT", "CONCAT2", "CONTAINS", "CONTAINS_TOKEN", "CONTAINS_TOKEN_LIKE", "CONTAINS_TOKEN_REGEXP", "COS", "COUNT", "COUNT", "COUNTN", "CUME_DIST", "CURL", "DATE_ADD_MILLIS", "DATE_ADD_STR", "DATE_DIFF_MILLIS", "DATE_DIFF_STR", "DATE_FORMAT_STR", "DATE_PART_MILLIS", "DATE_PART_STR", "DATE_RANGE_MILLIS", "DATE_RANGE_STR", "DATE_TRUNC_MILLIS", "DATE_TRUNC_STR", "DECODE", "DECODE_JSON", "DEGREES", "DENSE_RANK", "DURATION_TO_STR", "ENCODED_SIZE", "ENCODE_JSON", "EXP", "FIRST_VALUE", "FLOOR", "GREATEST", "HAS_TOKEN", "IFINF", "IFMISSING", "IFMISSINGORNULL", "IFNAN", "IFNANORINF", "IFNULL", "INITCAP", "ISARRAY", "ISATOM", "ISBITSET", "ISBOOLEAN", "ISNUMBER", "ISOBJECT", "ISSTRING", "LAG", "LAST_VALUE", "LEAD", "LEAST", "LENGTH", "LN", "LOG", "LOWER", "LTRIM", "MAX", "MEAN", "MEDIAN", "META", "MILLIS", "MILLIS_TO_LOCAL", "MILLIS_TO_STR", "MILLIS_TO_TZ", "MILLIS_TO_UTC", "MILLIS_TO_ZONE_NAME", "MIN", "MISSINGIF", "NANIF", "NEGINFIF", "NOW_LOCAL", "NOW_MILLIS", "NOW_STR", "NOW_TZ", "NOW_UTC", "NTH_VALUE", "NTILE", "NULLIF", "NVL", "NVL2", "OBJECT_ADD", "OBJECT_CONCAT", "OBJECT_INNER_PAIRS", "OBJECT_INNER_VALUES", "OBJECT_LENGTH", "OBJECT_NAMES", "OBJECT_PAIRS", "OBJECT_PUT", "OBJECT_REMOVE", "OBJECT_RENAME", "OBJECT_REPLACE", "OBJECT_UNWRAP", "OBJECT_VALUES", "PAIRS", "PERCENT_RANK", "PI", "POLY_LENGTH", "POSINFIF", "POSITION", "POWER", "RADIANS", "RANDOM", "RANK", "RATIO_TO_REPORT", "REGEXP_CONTAINS", "REGEXP_LIKE", "REGEXP_MATCHES", "REGEXP_POSITION", "REGEXP_REPLACE", "REGEXP_SPLIT", "REGEX_CONTAINS", "REGEX_LIKE", "REGEX_MATCHES", "REGEX_POSITION", "REGEX_REPLACE", "REGEX_SPLIT", "REPEAT", "REPLACE", "REVERSE", "ROUND", "ROW_NUMBER", "RTRIM", "SEARCH", "SEARCH_META", "SEARCH_SCORE", "SIGN", "SIN", "SPLIT", "SQRT", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STR_TO_DURATION", "STR_TO_MILLIS", "STR_TO_TZ", "STR_TO_UTC", "STR_TO_ZONE_NAME", "SUBSTR", "SUFFIXES", "SUM", "TAN", "TITLE", "TOARRAY", "TOATOM", "TOBOOLEAN", "TOKENS", "TOKENS", "TONUMBER", "TOOBJECT", "TOSTRING", "TRIM", "TRUNC", "UPPER", "UUID", "VARIANCE", "VARIANCE_POP", "VARIANCE_SAMP", "VAR_POP", "VAR_SAMP", "WEEKDAY_MILLIS", "WEEKDAY_STR", "CAST"]
        })
          , VE = o({
            all: ["ADVISE", "ALL", "ALTER", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "AT", "BEGIN", "BETWEEN", "BINARY", "BOOLEAN", "BREAK", "BUCKET", "BUILD", "BY", "CALL", "CASE", "CAST", "CLUSTER", "COLLATE", "COLLECTION", "COMMIT", "COMMITTED", "CONNECT", "CONTINUE", "CORRELATED", "COVER", "CREATE", "CURRENT", "DATABASE", "DATASET", "DATASTORE", "DECLARE", "DECREMENT", "DELETE", "DERIVED", "DESC", "DESCRIBE", "DISTINCT", "DO", "DROP", "EACH", "ELEMENT", "ELSE", "END", "EVERY", "EXCEPT", "EXCLUDE", "EXECUTE", "EXISTS", "EXPLAIN", "FALSE", "FETCH", "FILTER", "FIRST", "FLATTEN", "FLUSH", "FOLLOWING", "FOR", "FORCE", "FROM", "FTS", "FUNCTION", "GOLANG", "GRANT", "GROUP", "GROUPS", "GSI", "HASH", "HAVING", "IF", "ISOLATION", "IGNORE", "ILIKE", "IN", "INCLUDE", "INCREMENT", "INDEX", "INFER", "INLINE", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JAVASCRIPT", "JOIN", "KEY", "KEYS", "KEYSPACE", "KNOWN", "LANGUAGE", "LAST", "LEFT", "LET", "LETTING", "LEVEL", "LIKE", "LIMIT", "LSM", "MAP", "MAPPING", "MATCHED", "MATERIALIZED", "MERGE", "MINUS", "MISSING", "NAMESPACE", "NEST", "NL", "NO", "NOT", "NTH_VALUE", "NULL", "NULLS", "NUMBER", "OBJECT", "OFFSET", "ON", "OPTION", "OPTIONS", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARSE", "PARTITION", "PASSWORD", "PATH", "POOL", "PRECEDING", "PREPARE", "PRIMARY", "PRIVATE", "PRIVILEGE", "PROBE", "PROCEDURE", "PUBLIC", "RANGE", "RAW", "REALM", "REDUCE", "RENAME", "RESPECT", "RETURN", "RETURNING", "REVOKE", "RIGHT", "ROLE", "ROLLBACK", "ROW", "ROWS", "SATISFIES", "SAVEPOINT", "SCHEMA", "SCOPE", "SELECT", "SELF", "SEMI", "SET", "SHOW", "SOME", "START", "STATISTICS", "STRING", "SYSTEM", "THEN", "TIES", "TO", "TRAN", "TRANSACTION", "TRIGGER", "TRUE", "TRUNCATE", "UNBOUNDED", "UNDER", "UNION", "UNIQUE", "UNKNOWN", "UNNEST", "UNSET", "UPDATE", "UPSERT", "USE", "USER", "USING", "VALIDATE", "VALUE", "VALUED", "VALUES", "VIA", "VIEW", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH", "WITHIN", "WORK", "XOR"]
        })
          , pE = C(["SELECT [ALL | DISTINCT]"])
          , WE = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "SET", "MERGE INTO", "WHEN [NOT] MATCHED THEN", "UPDATE SET", "INSERT", "NEST", "UNNEST", "RETURNING"])
          , XE = C(["UPDATE", "DELETE FROM", "SET SCHEMA", "ADVISE", "ALTER INDEX", "BEGIN TRANSACTION", "BUILD INDEX", "COMMIT TRANSACTION", "CREATE COLLECTION", "CREATE FUNCTION", "CREATE INDEX", "CREATE PRIMARY INDEX", "CREATE SCOPE", "DROP COLLECTION", "DROP FUNCTION", "DROP INDEX", "DROP PRIMARY INDEX", "DROP SCOPE", "EXECUTE", "EXECUTE FUNCTION", "EXPLAIN", "GRANT", "INFER", "PREPARE", "REVOKE", "ROLLBACK TRANSACTION", "SAVEPOINT", "SET TRANSACTION", "UPDATE STATISTICS", "UPSERT", "LET", "SET CURRENT SCHEMA", "SHOW", "USE [PRIMARY] KEYS"])
          , cE = C(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"])
          , mE = C(["JOIN", "{LEFT | RIGHT} [OUTER] JOIN", "INNER JOIN"])
          , uE = C(["{ROWS | RANGE | GROUPS} BETWEEN"])
          , hE = {
            name: "n1ql",
            tokenizerOptions: {
                reservedSelect: pE,
                reservedClauses: [...WE, ...XE],
                reservedSetOperations: cE,
                reservedJoins: mE,
                reservedPhrases: uE,
                supportsXor: !0,
                reservedKeywords: VE,
                reservedFunctionNames: lE,
                stringTypes: ['""-bs', "''-bs"],
                identTypes: ["``"],
                extraParens: ["[]", "{}"],
                paramTypes: {
                    positional: !0,
                    numbered: ["$"],
                    named: ["$"]
                },
                lineCommentTypes: ["#", "--"],
                operators: ["%", "==", ":", "||"]
            },
            formatOptions: {
                onelineClauses: XE
            }
        }
          , dE = o({
            all: ["ADD", "AGENT", "AGGREGATE", "ALL", "ALTER", "AND", "ANY", "ARRAY", "ARROW", "AS", "ASC", "AT", "ATTRIBUTE", "AUTHID", "AVG", "BEGIN", "BETWEEN", "BFILE_BASE", "BINARY", "BLOB_BASE", "BLOCK", "BODY", "BOTH", "BOUND", "BULK", "BY", "BYTE", "CALL", "CALLING", "CASCADE", "CASE", "CHAR", "CHAR_BASE", "CHARACTER", "CHARSET", "CHARSETFORM", "CHARSETID", "CHECK", "CLOB_BASE", "CLOSE", "CLUSTER", "CLUSTERS", "COLAUTH", "COLLECT", "COLUMNS", "COMMENT", "COMMIT", "COMMITTED", "COMPILED", "COMPRESS", "CONNECT", "CONSTANT", "CONSTRUCTOR", "CONTEXT", "CONVERT", "COUNT", "CRASH", "CREATE", "CURRENT", "CURSOR", "CUSTOMDATUM", "DANGLING", "DATA", "DATE", "DATE_BASE", "DAY", "DECIMAL", "DECLARE", "DEFAULT", "DEFINE", "DELETE", "DESC", "DETERMINISTIC", "DISTINCT", "DOUBLE", "DROP", "DURATION", "ELEMENT", "ELSE", "ELSIF", "EMPTY", "END", "ESCAPE", "EXCEPT", "EXCEPTION", "EXCEPTIONS", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXIT", "EXTERNAL", "FETCH", "FINAL", "FIXED", "FLOAT", "FOR", "FORALL", "FORCE", "FORM", "FROM", "FUNCTION", "GENERAL", "GOTO", "GRANT", "GROUP", "HASH", "HAVING", "HEAP", "HIDDEN", "HOUR", "IDENTIFIED", "IF", "IMMEDIATE", "IN", "INCLUDING", "INDEX", "INDEXES", "INDICATOR", "INDICES", "INFINITE", "INSERT", "INSTANTIABLE", "INT", "INTERFACE", "INTERSECT", "INTERVAL", "INTO", "INVALIDATE", "IS", "ISOLATION", "JAVA", "LANGUAGE", "LARGE", "LEADING", "LENGTH", "LEVEL", "LIBRARY", "LIKE", "LIKE2", "LIKE4", "LIKEC", "LIMIT", "LIMITED", "LOCAL", "LOCK", "LONG", "LOOP", "MAP", "MAX", "MAXLEN", "MEMBER", "MERGE", "MIN", "MINUS", "MINUTE", "MOD", "MODE", "MODIFY", "MONTH", "MULTISET", "NAME", "NAN", "NATIONAL", "NATIVE", "NCHAR", "NEW", "NOCOMPRESS", "NOCOPY", "NOT", "NOWAIT", "NULL", "NUMBER_BASE", "OBJECT", "OCICOLL", "OCIDATE", "OCIDATETIME", "OCIDURATION", "OCIINTERVAL", "OCILOBLOCATOR", "OCINUMBER", "OCIRAW", "OCIREF", "OCIREFCURSOR", "OCIROWID", "OCISTRING", "OCITYPE", "OF", "ON", "ONLY", "OPAQUE", "OPEN", "OPERATOR", "OPTION", "OR", "ORACLE", "ORADATA", "ORDER", "OVERLAPS", "ORGANIZATION", "ORLANY", "ORLVARY", "OTHERS", "OUT", "OVERRIDING", "PACKAGE", "PARALLEL_ENABLE", "PARAMETER", "PARAMETERS", "PARTITION", "PASCAL", "PIPE", "PIPELINED", "PRAGMA", "PRECISION", "PRIOR", "PRIVATE", "PROCEDURE", "PUBLIC", "RAISE", "RANGE", "RAW", "READ", "RECORD", "REF", "REFERENCE", "REM", "REMAINDER", "RENAME", "RESOURCE", "RESULT", "RETURN", "RETURNING", "REVERSE", "REVOKE", "ROLLBACK", "ROW", "SAMPLE", "SAVE", "SAVEPOINT", "SB1", "SB2", "SB4", "SECOND", "SEGMENT", "SELECT", "SELF", "SEPARATE", "SEQUENCE", "SERIALIZABLE", "SET", "SHARE", "SHORT", "SIZE", "SIZE_T", "SOME", "SPARSE", "SQL", "SQLCODE", "SQLDATA", "SQLNAME", "SQLSTATE", "STANDARD", "START", "STATIC", "STDDEV", "STORED", "STRING", "STRUCT", "STYLE", "SUBMULTISET", "SUBPARTITION", "SUBSTITUTABLE", "SUBTYPE", "SUM", "SYNONYM", "TABAUTH", "TABLE", "TDO", "THE", "THEN", "TIME", "TIMESTAMP", "TIMEZONE_ABBR", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TIMEZONE_REGION", "TO", "TRAILING", "TRANSAC", "TRANSACTIONAL", "TRUSTED", "TYPE", "UB1", "UB2", "UB4", "UNDER", "UNION", "UNIQUE", "UNSIGNED", "UNTRUSTED", "UPDATE", "USE", "USING", "VALIST", "VALUE", "VALUES", "VARIABLE", "VARIANCE", "VARRAY", "VARYING", "VIEW", "VIEWS", "VOID", "WHEN", "WHERE", "WHILE", "WITH", "WORK", "WRAPPED", "WRITE", "YEAR", "ZONE"]
        })
          , KE = o({
            numeric: ["ABS", "ACOS", "ASIN", "ATAN", "ATAN2", "BITAND", "CEIL", "COS", "COSH", "EXP", "FLOOR", "LN", "LOG", "MOD", "NANVL", "POWER", "REMAINDER", "ROUND", "SIGN", "SIN", "SINH", "SQRT", "TAN", "TANH", "TRUNC", "WIDTH_BUCKET"],
            character: ["CHR", "CONCAT", "INITCAP", "LOWER", "LPAD", "LTRIM", "NLS_INITCAP", "NLS_LOWER", "NLSSORT", "NLS_UPPER", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPLACE", "RPAD", "RTRIM", "SOUNDEX", "SUBSTR", "TRANSLATE", "TREAT", "TRIM", "UPPER", "NLS_CHARSET_DECL_LEN", "NLS_CHARSET_ID", "NLS_CHARSET_NAME", "ASCII", "INSTR", "LENGTH", "REGEXP_INSTR"],
            datetime: ["ADD_MONTHS", "CURRENT_DATE", "CURRENT_TIMESTAMP", "DBTIMEZONE", "EXTRACT", "FROM_TZ", "LAST_DAY", "LOCALTIMESTAMP", "MONTHS_BETWEEN", "NEW_TIME", "NEXT_DAY", "NUMTODSINTERVAL", "NUMTOYMINTERVAL", "ROUND", "SESSIONTIMEZONE", "SYS_EXTRACT_UTC", "SYSDATE", "SYSTIMESTAMP", "TO_CHAR", "TO_TIMESTAMP", "TO_TIMESTAMP_TZ", "TO_DSINTERVAL", "TO_YMINTERVAL", "TRUNC", "TZ_OFFSET"],
            comparison: ["GREATEST", "LEAST"],
            conversion: ["ASCIISTR", "BIN_TO_NUM", "CAST", "CHARTOROWID", "COMPOSE", "CONVERT", "DECOMPOSE", "HEXTORAW", "NUMTODSINTERVAL", "NUMTOYMINTERVAL", "RAWTOHEX", "RAWTONHEX", "ROWIDTOCHAR", "ROWIDTONCHAR", "SCN_TO_TIMESTAMP", "TIMESTAMP_TO_SCN", "TO_BINARY_DOUBLE", "TO_BINARY_FLOAT", "TO_CHAR", "TO_CLOB", "TO_DATE", "TO_DSINTERVAL", "TO_LOB", "TO_MULTI_BYTE", "TO_NCHAR", "TO_NCLOB", "TO_NUMBER", "TO_DSINTERVAL", "TO_SINGLE_BYTE", "TO_TIMESTAMP", "TO_TIMESTAMP_TZ", "TO_YMINTERVAL", "TO_YMINTERVAL", "TRANSLATE", "UNISTR"],
            largeObject: ["BFILENAME", "EMPTY_BLOB,", "EMPTY_CLOB"],
            collection: ["CARDINALITY", "COLLECT", "POWERMULTISET", "POWERMULTISET_BY_CARDINALITY", "SET"],
            hierarchical: ["SYS_CONNECT_BY_PATH"],
            dataMining: ["CLUSTER_ID", "CLUSTER_PROBABILITY", "CLUSTER_SET", "FEATURE_ID", "FEATURE_SET", "FEATURE_VALUE", "PREDICTION", "PREDICTION_COST", "PREDICTION_DETAILS", "PREDICTION_PROBABILITY", "PREDICTION_SET"],
            xml: ["APPENDCHILDXML", "DELETEXML", "DEPTH", "EXTRACT", "EXISTSNODE", "EXTRACTVALUE", "INSERTCHILDXML", "INSERTXMLBEFORE", "PATH", "SYS_DBURIGEN", "SYS_XMLAGG", "SYS_XMLGEN", "UPDATEXML", "XMLAGG", "XMLCDATA", "XMLCOLATTVAL", "XMLCOMMENT", "XMLCONCAT", "XMLFOREST", "XMLPARSE", "XMLPI", "XMLQUERY", "XMLROOT", "XMLSEQUENCE", "XMLSERIALIZE", "XMLTABLE", "XMLTRANSFORM"],
            encoding: ["DECODE", "DUMP", "ORA_HASH", "VSIZE"],
            nullRelated: ["COALESCE", "LNNVL", "NULLIF", "NVL", "NVL2"],
            env: ["SYS_CONTEXT", "SYS_GUID", "SYS_TYPEID", "UID", "USER", "USERENV"],
            aggregate: ["AVG", "COLLECT", "CORR", "CORR_S", "CORR_K", "COUNT", "COVAR_POP", "COVAR_SAMP", "CUME_DIST", "DENSE_RANK", "FIRST", "GROUP_ID", "GROUPING", "GROUPING_ID", "LAST", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "RANK", "REGR_SLOPE", "REGR_INTERCEPT", "REGR_COUNT", "REGR_R2", "REGR_AVGX", "REGR_AVGY", "REGR_SXX", "REGR_SYY", "REGR_SXY", "STATS_BINOMIAL_TEST", "STATS_CROSSTAB", "STATS_F_TEST", "STATS_KS_TEST", "STATS_MODE", "STATS_MW_TEST", "STATS_ONE_WAY_ANOVA", "STATS_T_TEST_ONE", "STATS_T_TEST_PAIRED", "STATS_T_TEST_INDEP", "STATS_T_TEST_INDEPU", "STATS_WSR_TEST", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUM", "VAR_POP", "VAR_SAMP", "VARIANCE"],
            window: ["FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTILE", "RATIO_TO_REPORT", "ROW_NUMBER"],
            objectReference: ["DEREF", "MAKE_REF", "REF", "REFTOHEX", "VALUE"],
            model: ["CV", "ITERATION_NUMBER", "PRESENTNNV", "PRESENTV", "PREVIOUS"],
            dataTypes: ["VARCHAR2", "NVARCHAR2", "NUMBER", "FLOAT", "TIMESTAMP", "INTERVAL YEAR", "INTERVAL DAY", "RAW", "UROWID", "NCHAR", "CHARACTER", "CHAR", "CHARACTER VARYING", "CHAR VARYING", "NATIONAL CHARACTER", "NATIONAL CHAR", "NATIONAL CHARACTER VARYING", "NATIONAL CHAR VARYING", "NCHAR VARYING", "NUMERIC", "DECIMAL", "FLOAT", "VARCHAR"]
        })
          , yE = C(["SELECT [ALL | DISTINCT | UNIQUE]"])
          , fE = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER [SIBLINGS] BY", "OFFSET", "FETCH {FIRST | NEXT}", "FOR UPDATE [OF]", "INSERT [INTO | ALL INTO]", "VALUES", "SET", "MERGE [INTO]", "WHEN [NOT] MATCHED [THEN]", "UPDATE SET", "CREATE [OR REPLACE] [NO FORCE | FORCE] [EDITIONING | EDITIONABLE | EDITIONABLE EDITIONING | NONEDITIONABLE] VIEW", "CREATE MATERIALIZED VIEW", "CREATE [GLOBAL TEMPORARY | PRIVATE TEMPORARY | SHARDED | DUPLICATED | IMMUTABLE BLOCKCHAIN | BLOCKCHAIN | IMMUTABLE] TABLE", "RETURNING"])
          , bE = C(["UPDATE [ONLY]", "DELETE FROM [ONLY]", "DROP TABLE", "ALTER TABLE", "ADD", "DROP {COLUMN | UNUSED COLUMNS | COLUMNS CONTINUE}", "MODIFY", "RENAME TO", "RENAME COLUMN", "TRUNCATE TABLE", "SET SCHEMA", "BEGIN", "CONNECT BY", "DECLARE", "EXCEPT", "EXCEPTION", "LOOP", "START WITH"])
          , xE = C(["UNION [ALL]", "EXCEPT", "INTERSECT"])
          , JE = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN", "{CROSS | OUTER} APPLY"])
          , gE = C(["ON {UPDATE | DELETE} [SET NULL]", "ON COMMIT", "{ROWS | RANGE} BETWEEN"])
          , $E = {
            name: "plsql",
            tokenizerOptions: {
                reservedSelect: yE,
                reservedClauses: [...fE, ...bE],
                reservedSetOperations: xE,
                reservedJoins: JE,
                reservedPhrases: gE,
                supportsXor: !0,
                reservedKeywords: dE,
                reservedFunctionNames: KE,
                stringTypes: [{
                    quote: "''-qq",
                    prefixes: ["N"]
                }, {
                    quote: "q''",
                    prefixes: ["N"]
                }],
                identTypes: ['""-qq'],
                identChars: {
                    rest: "$#"
                },
                variableTypes: [{
                    regex: "&{1,2}[A-Za-z][A-Za-z0-9_$#]*"
                }],
                paramTypes: {
                    numbered: [":"],
                    named: [":"]
                },
                paramChars: {},
                operators: ["**", ":=", "%", "~=", "^=", ">>", "<<", "=>", "@", "||"],
                postProcess: function(T) {
                    let R = N;
                    return T.map((T=>I.SET(T) && I.BY(R) ? Object.assign(Object.assign({}, T), {
                        type: E.RESERVED_KEYWORD
                    }) : (L(T.type) && (R = T),
                    T)))
                }
            },
            formatOptions: {
                alwaysDenseOperators: ["@"],
                onelineClauses: bE
            }
        }
          , wE = o({
            math: ["ABS", "ACOS", "ACOSD", "ACOSH", "ASIN", "ASIND", "ASINH", "ATAN", "ATAN2", "ATAN2D", "ATAND", "ATANH", "CBRT", "CEIL", "CEILING", "COS", "COSD", "COSH", "COT", "COTD", "DEGREES", "DIV", "EXP", "FACTORIAL", "FLOOR", "GCD", "LCM", "LN", "LOG", "LOG10", "MIN_SCALE", "MOD", "PI", "POWER", "RADIANS", "RANDOM", "ROUND", "SCALE", "SETSEED", "SIGN", "SIN", "SIND", "SINH", "SQRT", "TAN", "TAND", "TANH", "TRIM_SCALE", "TRUNC", "WIDTH_BUCKET"],
            string: ["ABS", "ASCII", "BIT_LENGTH", "BTRIM", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHR", "CONCAT", "CONCAT_WS", "FORMAT", "INITCAP", "LEFT", "LENGTH", "LOWER", "LPAD", "LTRIM", "MD5", "NORMALIZE", "OCTET_LENGTH", "OVERLAY", "PARSE_IDENT", "PG_CLIENT_ENCODING", "POSITION", "QUOTE_IDENT", "QUOTE_LITERAL", "QUOTE_NULLABLE", "REGEXP_MATCH", "REGEXP_MATCHES", "REGEXP_REPLACE", "REGEXP_SPLIT_TO_ARRAY", "REGEXP_SPLIT_TO_TABLE", "REPEAT", "REPLACE", "REVERSE", "RIGHT", "RPAD", "RTRIM", "SPLIT_PART", "SPRINTF", "STARTS_WITH", "STRING_AGG", "STRING_TO_ARRAY", "STRING_TO_TABLE", "STRPOS", "SUBSTR", "SUBSTRING", "TO_ASCII", "TO_HEX", "TRANSLATE", "TRIM", "UNISTR", "UPPER"],
            binary: ["BIT_COUNT", "BIT_LENGTH", "BTRIM", "CONVERT", "CONVERT_FROM", "CONVERT_TO", "DECODE", "ENCODE", "GET_BIT", "GET_BYTE", "LENGTH", "LTRIM", "MD5", "OCTET_LENGTH", "OVERLAY", "POSITION", "RTRIM", "SET_BIT", "SET_BYTE", "SHA224", "SHA256", "SHA384", "SHA512", "STRING_AGG", "SUBSTR", "SUBSTRING", "TRIM"],
            bitstring: ["BIT_COUNT", "BIT_LENGTH", "GET_BIT", "LENGTH", "OCTET_LENGTH", "OVERLAY", "POSITION", "SET_BIT", "SUBSTRING"],
            pattern: ["REGEXP_MATCH", "REGEXP_MATCHES", "REGEXP_REPLACE", "REGEXP_SPLIT_TO_ARRAY", "REGEXP_SPLIT_TO_TABLE"],
            datatype: ["TO_CHAR", "TO_DATE", "TO_NUMBER", "TO_TIMESTAMP"],
            datetime: ["CLOCK_TIMESTAMP", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATE_BIN", "DATE_PART", "DATE_TRUNC", "EXTRACT", "ISFINITE", "JUSTIFY_DAYS", "JUSTIFY_HOURS", "JUSTIFY_INTERVAL", "LOCALTIME", "LOCALTIMESTAMP", "MAKE_DATE", "MAKE_INTERVAL", "MAKE_TIME", "MAKE_TIMESTAMP", "MAKE_TIMESTAMPTZ", "NOW", "PG_SLEEP", "PG_SLEEP_FOR", "PG_SLEEP_UNTIL", "STATEMENT_TIMESTAMP", "TIMEOFDAY", "TO_TIMESTAMP", "TRANSACTION_TIMESTAMP"],
            enum: ["ENUM_FIRST", "ENUM_LAST", "ENUM_RANGE"],
            geometry: ["AREA", "BOUND_BOX", "BOX", "CENTER", "CIRCLE", "DIAGONAL", "DIAMETER", "HEIGHT", "ISCLOSED", "ISOPEN", "LENGTH", "LINE", "LSEG", "NPOINTS", "PATH", "PCLOSE", "POINT", "POLYGON", "POPEN", "RADIUS", "SLOPE", "WIDTH"],
            network: ["ABBREV", "BROADCAST", "FAMILY", "HOST", "HOSTMASK", "INET_MERGE", "INET_SAME_FAMILY", "MACADDR8_SET7BIT", "MASKLEN", "NETMASK", "NETWORK", "SET_MASKLEN", "TEXT", "TRUNC"],
            textsearch: ["ARRAY_TO_TSVECTOR", "GET_CURRENT_TS_CONFIG", "JSONB_TO_TSVECTOR", "JSON_TO_TSVECTOR", "LENGTH", "NUMNODE", "PHRASETO_TSQUERY", "PLAINTO_TSQUERY", "QUERYTREE", "SETWEIGHT", "STRIP", "TO_TSQUERY", "TO_TSVECTOR", "TSQUERY_PHRASE", "TSVECTOR_TO_ARRAY", "TS_DEBUG", "TS_DELETE", "TS_FILTER", "TS_HEADLINE", "TS_LEXIZE", "TS_PARSE", "TS_RANK", "TS_RANK_CD", "TS_REWRITE", "TS_STAT", "TS_TOKEN_TYPE", "WEBSEARCH_TO_TSQUERY"],
            uuid: ["UUID"],
            xml: ["CURSOR_TO_XML", "CURSOR_TO_XMLSCHEMA", "DATABASE_TO_XML", "DATABASE_TO_XMLSCHEMA", "DATABASE_TO_XML_AND_XMLSCHEMA", "NEXTVAL", "QUERY_TO_XML", "QUERY_TO_XMLSCHEMA", "QUERY_TO_XML_AND_XMLSCHEMA", "SCHEMA_TO_XML", "SCHEMA_TO_XMLSCHEMA", "SCHEMA_TO_XML_AND_XMLSCHEMA", "STRING", "TABLE_TO_XML", "TABLE_TO_XMLSCHEMA", "TABLE_TO_XML_AND_XMLSCHEMA", "XMLAGG", "XMLCOMMENT", "XMLCONCAT", "XMLELEMENT", "XMLEXISTS", "XMLFOREST", "XMLPARSE", "XMLPI", "XMLROOT", "XMLSERIALIZE", "XMLTABLE", "XML_IS_WELL_FORMED", "XML_IS_WELL_FORMED_CONTENT", "XML_IS_WELL_FORMED_DOCUMENT", "XPATH", "XPATH_EXISTS"],
            json: ["ARRAY_TO_JSON", "JSONB_AGG", "JSONB_ARRAY_ELEMENTS", "JSONB_ARRAY_ELEMENTS_TEXT", "JSONB_ARRAY_LENGTH", "JSONB_BUILD_ARRAY", "JSONB_BUILD_OBJECT", "JSONB_EACH", "JSONB_EACH_TEXT", "JSONB_EXTRACT_PATH", "JSONB_EXTRACT_PATH_TEXT", "JSONB_INSERT", "JSONB_OBJECT", "JSONB_OBJECT_AGG", "JSONB_OBJECT_KEYS", "JSONB_PATH_EXISTS", "JSONB_PATH_EXISTS_TZ", "JSONB_PATH_MATCH", "JSONB_PATH_MATCH_TZ", "JSONB_PATH_QUERY", "JSONB_PATH_QUERY_ARRAY", "JSONB_PATH_QUERY_ARRAY_TZ", "JSONB_PATH_QUERY_FIRST", "JSONB_PATH_QUERY_FIRST_TZ", "JSONB_PATH_QUERY_TZ", "JSONB_POPULATE_RECORD", "JSONB_POPULATE_RECORDSET", "JSONB_PRETTY", "JSONB_SET", "JSONB_SET_LAX", "JSONB_STRIP_NULLS", "JSONB_TO_RECORD", "JSONB_TO_RECORDSET", "JSONB_TYPEOF", "JSON_AGG", "JSON_ARRAY_ELEMENTS", "JSON_ARRAY_ELEMENTS_TEXT", "JSON_ARRAY_LENGTH", "JSON_BUILD_ARRAY", "JSON_BUILD_OBJECT", "JSON_EACH", "JSON_EACH_TEXT", "JSON_EXTRACT_PATH", "JSON_EXTRACT_PATH_TEXT", "JSON_OBJECT", "JSON_OBJECT_AGG", "JSON_OBJECT_KEYS", "JSON_POPULATE_RECORD", "JSON_POPULATE_RECORDSET", "JSON_STRIP_NULLS", "JSON_TO_RECORD", "JSON_TO_RECORDSET", "JSON_TYPEOF", "ROW_TO_JSON", "TO_JSON", "TO_JSONB", "TO_TIMESTAMP"],
            sequence: ["CURRVAL", "LASTVAL", "NEXTVAL", "SETVAL"],
            conditional: ["COALESCE", "GREATEST", "LEAST", "NULLIF"],
            array: ["ARRAY_AGG", "ARRAY_APPEND", "ARRAY_CAT", "ARRAY_DIMS", "ARRAY_FILL", "ARRAY_LENGTH", "ARRAY_LOWER", "ARRAY_NDIMS", "ARRAY_POSITION", "ARRAY_POSITIONS", "ARRAY_PREPEND", "ARRAY_REMOVE", "ARRAY_REPLACE", "ARRAY_TO_STRING", "ARRAY_UPPER", "CARDINALITY", "STRING_TO_ARRAY", "TRIM_ARRAY", "UNNEST"],
            range: ["ISEMPTY", "LOWER", "LOWER_INC", "LOWER_INF", "MULTIRANGE", "RANGE_MERGE", "UPPER", "UPPER_INC", "UPPER_INF"],
            aggregate: ["ARRAY_AGG", "AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "BOOL_AND", "BOOL_OR", "COALESCE", "CORR", "COUNT", "COVAR_POP", "COVAR_SAMP", "CUME_DIST", "DENSE_RANK", "EVERY", "GROUPING", "JSONB_AGG", "JSONB_OBJECT_AGG", "JSON_AGG", "JSON_OBJECT_AGG", "MAX", "MIN", "MODE", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "RANGE_AGG", "RANGE_INTERSECT_AGG", "RANK", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STRING_AGG", "SUM", "TO_JSON", "TO_JSONB", "VARIANCE", "VAR_POP", "VAR_SAMP", "XMLAGG"],
            window: ["CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "RANK", "ROW_NUMBER"],
            set: ["GENERATE_SERIES", "GENERATE_SUBSCRIPTS"],
            sysInfo: ["ACLDEFAULT", "ACLEXPLODE", "COL_DESCRIPTION", "CURRENT_CATALOG", "CURRENT_DATABASE", "CURRENT_QUERY", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_USER", "FORMAT_TYPE", "HAS_ANY_COLUMN_PRIVILEGE", "HAS_COLUMN_PRIVILEGE", "HAS_DATABASE_PRIVILEGE", "HAS_FOREIGN_DATA_WRAPPER_PRIVILEGE", "HAS_FUNCTION_PRIVILEGE", "HAS_LANGUAGE_PRIVILEGE", "HAS_SCHEMA_PRIVILEGE", "HAS_SEQUENCE_PRIVILEGE", "HAS_SERVER_PRIVILEGE", "HAS_TABLESPACE_PRIVILEGE", "HAS_TABLE_PRIVILEGE", "HAS_TYPE_PRIVILEGE", "INET_CLIENT_ADDR", "INET_CLIENT_PORT", "INET_SERVER_ADDR", "INET_SERVER_PORT", "MAKEACLITEM", "OBJ_DESCRIPTION", "PG_BACKEND_PID", "PG_BLOCKING_PIDS", "PG_COLLATION_IS_VISIBLE", "PG_CONF_LOAD_TIME", "PG_CONTROL_CHECKPOINT", "PG_CONTROL_INIT", "PG_CONTROL_SYSTEM", "PG_CONVERSION_IS_VISIBLE", "PG_CURRENT_LOGFILE", "PG_CURRENT_SNAPSHOT", "PG_CURRENT_XACT_ID", "PG_CURRENT_XACT_ID_IF_ASSIGNED", "PG_DESCRIBE_OBJECT", "PG_FUNCTION_IS_VISIBLE", "PG_GET_CATALOG_FOREIGN_KEYS", "PG_GET_CONSTRAINTDEF", "PG_GET_EXPR", "PG_GET_FUNCTIONDEF", "PG_GET_FUNCTION_ARGUMENTS", "PG_GET_FUNCTION_IDENTITY_ARGUMENTS", "PG_GET_FUNCTION_RESULT", "PG_GET_INDEXDEF", "PG_GET_KEYWORDS", "PG_GET_OBJECT_ADDRESS", "PG_GET_OWNED_SEQUENCE", "PG_GET_RULEDEF", "PG_GET_SERIAL_SEQUENCE", "PG_GET_STATISTICSOBJDEF", "PG_GET_TRIGGERDEF", "PG_GET_USERBYID", "PG_GET_VIEWDEF", "PG_HAS_ROLE", "PG_IDENTIFY_OBJECT", "PG_IDENTIFY_OBJECT_AS_ADDRESS", "PG_INDEXAM_HAS_PROPERTY", "PG_INDEX_COLUMN_HAS_PROPERTY", "PG_INDEX_HAS_PROPERTY", "PG_IS_OTHER_TEMP_SCHEMA", "PG_JIT_AVAILABLE", "PG_LAST_COMMITTED_XACT", "PG_LISTENING_CHANNELS", "PG_MY_TEMP_SCHEMA", "PG_NOTIFICATION_QUEUE_USAGE", "PG_OPCLASS_IS_VISIBLE", "PG_OPERATOR_IS_VISIBLE", "PG_OPFAMILY_IS_VISIBLE", "PG_OPTIONS_TO_TABLE", "PG_POSTMASTER_START_TIME", "PG_SAFE_SNAPSHOT_BLOCKING_PIDS", "PG_SNAPSHOT_XIP", "PG_SNAPSHOT_XMAX", "PG_SNAPSHOT_XMIN", "PG_STATISTICS_OBJ_IS_VISIBLE", "PG_TABLESPACE_DATABASES", "PG_TABLESPACE_LOCATION", "PG_TABLE_IS_VISIBLE", "PG_TRIGGER_DEPTH", "PG_TS_CONFIG_IS_VISIBLE", "PG_TS_DICT_IS_VISIBLE", "PG_TS_PARSER_IS_VISIBLE", "PG_TS_TEMPLATE_IS_VISIBLE", "PG_TYPEOF", "PG_TYPE_IS_VISIBLE", "PG_VISIBLE_IN_SNAPSHOT", "PG_XACT_COMMIT_TIMESTAMP", "PG_XACT_COMMIT_TIMESTAMP_ORIGIN", "PG_XACT_STATUS", "PQSERVERVERSION", "ROW_SECURITY_ACTIVE", "SESSION_USER", "SHOBJ_DESCRIPTION", "TO_REGCLASS", "TO_REGCOLLATION", "TO_REGNAMESPACE", "TO_REGOPER", "TO_REGOPERATOR", "TO_REGPROC", "TO_REGPROCEDURE", "TO_REGROLE", "TO_REGTYPE", "TXID_CURRENT", "TXID_CURRENT_IF_ASSIGNED", "TXID_CURRENT_SNAPSHOT", "TXID_SNAPSHOT_XIP", "TXID_SNAPSHOT_XMAX", "TXID_SNAPSHOT_XMIN", "TXID_STATUS", "TXID_VISIBLE_IN_SNAPSHOT", "USER", "VERSION"],
            sysAdmin: ["BRIN_DESUMMARIZE_RANGE", "BRIN_SUMMARIZE_NEW_VALUES", "BRIN_SUMMARIZE_RANGE", "CONVERT_FROM", "CURRENT_SETTING", "GIN_CLEAN_PENDING_LIST", "PG_ADVISORY_LOCK", "PG_ADVISORY_LOCK_SHARED", "PG_ADVISORY_UNLOCK", "PG_ADVISORY_UNLOCK_ALL", "PG_ADVISORY_UNLOCK_SHARED", "PG_ADVISORY_XACT_LOCK", "PG_ADVISORY_XACT_LOCK_SHARED", "PG_BACKUP_START_TIME", "PG_CANCEL_BACKEND", "PG_COLLATION_ACTUAL_VERSION", "PG_COLUMN_COMPRESSION", "PG_COLUMN_SIZE", "PG_COPY_LOGICAL_REPLICATION_SLOT", "PG_COPY_PHYSICAL_REPLICATION_SLOT", "PG_CREATE_LOGICAL_REPLICATION_SLOT", "PG_CREATE_PHYSICAL_REPLICATION_SLOT", "PG_CREATE_RESTORE_POINT", "PG_CURRENT_WAL_FLUSH_LSN", "PG_CURRENT_WAL_INSERT_LSN", "PG_CURRENT_WAL_LSN", "PG_DATABASE_SIZE", "PG_DROP_REPLICATION_SLOT", "PG_EXPORT_SNAPSHOT", "PG_FILENODE_RELATION", "PG_GET_WAL_REPLAY_PAUSE_STATE", "PG_IMPORT_SYSTEM_COLLATIONS", "PG_INDEXES_SIZE", "PG_IS_IN_BACKUP", "PG_IS_IN_RECOVERY", "PG_IS_WAL_REPLAY_PAUSED", "PG_LAST_WAL_RECEIVE_LSN", "PG_LAST_WAL_REPLAY_LSN", "PG_LAST_XACT_REPLAY_TIMESTAMP", "PG_LOGICAL_EMIT_MESSAGE", "PG_LOGICAL_SLOT_GET_BINARY_CHANGES", "PG_LOGICAL_SLOT_GET_CHANGES", "PG_LOGICAL_SLOT_PEEK_BINARY_CHANGES", "PG_LOGICAL_SLOT_PEEK_CHANGES", "PG_LOG_BACKEND_MEMORY_CONTEXTS", "PG_LS_ARCHIVE_STATUSDIR", "PG_LS_DIR", "PG_LS_LOGDIR", "PG_LS_TMPDIR", "PG_LS_WALDIR", "PG_PARTITION_ANCESTORS", "PG_PARTITION_ROOT", "PG_PARTITION_TREE", "PG_PROMOTE", "PG_READ_BINARY_FILE", "PG_READ_FILE", "PG_RELATION_FILENODE", "PG_RELATION_FILEPATH", "PG_RELATION_SIZE", "PG_RELOAD_CONF", "PG_REPLICATION_ORIGIN_ADVANCE", "PG_REPLICATION_ORIGIN_CREATE", "PG_REPLICATION_ORIGIN_DROP", "PG_REPLICATION_ORIGIN_OID", "PG_REPLICATION_ORIGIN_PROGRESS", "PG_REPLICATION_ORIGIN_SESSION_IS_SETUP", "PG_REPLICATION_ORIGIN_SESSION_PROGRESS", "PG_REPLICATION_ORIGIN_SESSION_RESET", "PG_REPLICATION_ORIGIN_SESSION_SETUP", "PG_REPLICATION_ORIGIN_XACT_RESET", "PG_REPLICATION_ORIGIN_XACT_SETUP", "PG_REPLICATION_SLOT_ADVANCE", "PG_ROTATE_LOGFILE", "PG_SIZE_BYTES", "PG_SIZE_PRETTY", "PG_START_BACKUP", "PG_STAT_FILE", "PG_STOP_BACKUP", "PG_SWITCH_WAL", "PG_TABLESPACE_SIZE", "PG_TABLE_SIZE", "PG_TERMINATE_BACKEND", "PG_TOTAL_RELATION_SIZE", "PG_TRY_ADVISORY_LOCK", "PG_TRY_ADVISORY_LOCK_SHARED", "PG_TRY_ADVISORY_XACT_LOCK", "PG_TRY_ADVISORY_XACT_LOCK_SHARED", "PG_WALFILE_NAME", "PG_WALFILE_NAME_OFFSET", "PG_WAL_LSN_DIFF", "PG_WAL_REPLAY_PAUSE", "PG_WAL_REPLAY_RESUME", "SET_CONFIG"],
            trigger: ["SUPPRESS_REDUNDANT_UPDATES_TRIGGER", "TSVECTOR_UPDATE_TRIGGER", "TSVECTOR_UPDATE_TRIGGER_COLUMN"],
            eventTrigger: ["PG_EVENT_TRIGGER_DDL_COMMANDS", "PG_EVENT_TRIGGER_DROPPED_OBJECTS", "PG_EVENT_TRIGGER_TABLE_REWRITE_OID", "PG_EVENT_TRIGGER_TABLE_REWRITE_REASON", "PG_GET_OBJECT_ADDRESS"],
            stats: ["PG_MCV_LIST_ITEMS"],
            cast: ["CAST"],
            dataTypes: ["BIT", "BIT VARYING", "CHARACTER", "CHARACTER VARYING", "VARCHAR", "CHAR", "DECIMAL", "NUMERIC", "TIME", "TIMESTAMP", "ENUM"]
        })
          , vE = o({
            all: ["ABORT", "ABSOLUTE", "ACCESS", "ACTION", "ADD", "ADMIN", "AFTER", "AGGREGATE", "ALL", "ALSO", "ALTER", "ALWAYS", "ANALYSE", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "ASENSITIVE", "ASSERTION", "ASSIGNMENT", "ASYMMETRIC", "AT", "ATOMIC", "ATTACH", "ATTRIBUTE", "AUTHORIZATION", "BACKWARD", "BEFORE", "BEGIN", "BETWEEN", "BIGINT", "BINARY", "BIT", "BOOLEAN", "BOTH", "BREADTH", "BY", "CACHE", "CALL", "CALLED", "CASCADE", "CASCADED", "CASE", "CAST", "CATALOG", "CHAIN", "CHAR", "CHARACTER", "CHARACTERISTICS", "CHECK", "CHECKPOINT", "CLASS", "CLOSE", "CLUSTER", "COALESCE", "COLLATE", "COLLATION", "COLUMN", "COLUMNS", "COMMENT", "COMMENTS", "COMMIT", "COMMITTED", "COMPRESSION", "CONCURRENTLY", "CONFIGURATION", "CONFLICT", "CONNECTION", "CONSTRAINT", "CONSTRAINTS", "CONTENT", "CONTINUE", "CONVERSION", "COPY", "COST", "CREATE", "CROSS", "CSV", "CUBE", "CURRENT", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "CYCLE", "DATA", "DATABASE", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFAULTS", "DEFERRABLE", "DEFERRED", "DEFINER", "DELETE", "DELIMITER", "DELIMITERS", "DEPENDS", "DEPTH", "DESC", "DETACH", "DICTIONARY", "DISABLE", "DISCARD", "DISTINCT", "DO", "DOCUMENT", "DOMAIN", "DOUBLE", "DROP", "EACH", "ELSE", "ENABLE", "ENCODING", "ENCRYPTED", "END", "ENUM", "ESCAPE", "EVENT", "EXCEPT", "EXCLUDE", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXPLAIN", "EXPRESSION", "EXTENSION", "EXTERNAL", "EXTRACT", "FALSE", "FAMILY", "FETCH", "FILTER", "FINALIZE", "FIRST", "FLOAT", "FOLLOWING", "FOR", "FORCE", "FOREIGN", "FORWARD", "FREEZE", "FROM", "FULL", "FUNCTION", "FUNCTIONS", "GENERATED", "GLOBAL", "GRANT", "GRANTED", "GREATEST", "GROUP", "GROUPING", "GROUPS", "HANDLER", "HAVING", "HEADER", "HOLD", "HOUR", "IDENTITY", "IF", "ILIKE", "IMMEDIATE", "IMMUTABLE", "IMPLICIT", "IMPORT", "IN", "INCLUDE", "INCLUDING", "INCREMENT", "INDEX", "INDEXES", "INHERIT", "INHERITS", "INITIALLY", "INLINE", "INNER", "INOUT", "INPUT", "INSENSITIVE", "INSERT", "INSTEAD", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "INVOKER", "IS", "ISNULL", "ISOLATION", "JOIN", "KEY", "LABEL", "LANGUAGE", "LARGE", "LAST", "LATERAL", "LEADING", "LEAKPROOF", "LEAST", "LEFT", "LEVEL", "LIKE", "LIMIT", "LISTEN", "LOAD", "LOCAL", "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCK", "LOCKED", "LOGGED", "MAPPING", "MATCH", "MATERIALIZED", "MAXVALUE", "METHOD", "MINUTE", "MINVALUE", "MODE", "MONTH", "MOVE", "NAME", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NEW", "NEXT", "NFC", "NFD", "NFKC", "NFKD", "NO", "NONE", "NORMALIZE", "NORMALIZED", "NOT", "NOTHING", "NOTIFY", "NOTNULL", "NOWAIT", "NULL", "NULLIF", "NULLS", "NUMERIC", "OBJECT", "OF", "OFF", "OFFSET", "OIDS", "OLD", "ON", "ONLY", "OPERATOR", "OPTION", "OPTIONS", "OR", "ORDER", "ORDINALITY", "OTHERS", "OUT", "OUTER", "OVER", "OVERLAPS", "OVERLAY", "OVERRIDING", "OWNED", "OWNER", "PARALLEL", "PARSER", "PARTIAL", "PARTITION", "PASSING", "PASSWORD", "PLACING", "PLANS", "POLICY", "POSITION", "PRECEDING", "PRECISION", "PREPARE", "PREPARED", "PRESERVE", "PRIMARY", "PRIOR", "PRIVILEGES", "PROCEDURAL", "PROCEDURE", "PROCEDURES", "PROGRAM", "PUBLICATION", "QUOTE", "RANGE", "READ", "REAL", "REASSIGN", "RECHECK", "RECURSIVE", "REF", "REFERENCES", "REFERENCING", "REFRESH", "REINDEX", "RELATIVE", "RELEASE", "RENAME", "REPEATABLE", "REPLACE", "REPLICA", "RESET", "RESTART", "RESTRICT", "RETURN", "RETURNING", "RETURNS", "REVOKE", "RIGHT", "ROLE", "ROLLBACK", "ROLLUP", "ROUTINE", "ROUTINES", "ROW", "ROWS", "RULE", "SAVEPOINT", "SCHEMA", "SCHEMAS", "SCROLL", "SEARCH", "SECOND", "SECURITY", "SELECT", "SEQUENCE", "SEQUENCES", "SERIALIZABLE", "SERVER", "SESSION", "SESSION_USER", "SET", "SETOF", "SETS", "SHARE", "SHOW", "SIMILAR", "SIMPLE", "SKIP", "SMALLINT", "SNAPSHOT", "SOME", "SQL", "STABLE", "STANDALONE", "START", "STATEMENT", "STATISTICS", "STDIN", "STDOUT", "STORAGE", "STORED", "STRICT", "STRIP", "SUBSCRIPTION", "SUBSTRING", "SUPPORT", "SYMMETRIC", "SYSID", "SYSTEM", "TABLE", "TABLES", "TABLESAMPLE", "TABLESPACE", "TEMP", "TEMPLATE", "TEMPORARY", "TEXT", "THEN", "TIES", "TIME", "TIMESTAMP", "TO", "TRAILING", "TRANSACTION", "TRANSFORM", "TREAT", "TRIGGER", "TRIM", "TRUE", "TRUNCATE", "TRUSTED", "TYPE", "TYPES", "UESCAPE", "UNBOUNDED", "UNCOMMITTED", "UNENCRYPTED", "UNION", "UNIQUE", "UNKNOWN", "UNLISTEN", "UNLOGGED", "UNTIL", "UPDATE", "USER", "USING", "VACUUM", "VALID", "VALIDATE", "VALIDATOR", "VALUE", "VALUES", "VARCHAR", "VARIADIC", "VARYING", "VERBOSE", "VERSION", "VIEW", "VIEWS", "VOLATILE", "WHEN", "WHERE", "WHITESPACE", "WINDOW", "WITH", "WITHIN", "WITHOUT", "WORK", "WRAPPER", "WRITE", "XML", "XMLATTRIBUTES", "XMLCONCAT", "XMLELEMENT", "XMLEXISTS", "XMLFOREST", "XMLNAMESPACES", "XMLPARSE", "XMLPI", "XMLROOT", "XMLSERIALIZE", "XMLTABLE", "YEAR", "YES", "ZONE"]
        })
          , QE = C(["SELECT [ALL | DISTINCT]"])
          , ZE = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY [ALL | DISTINCT]", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "FETCH {FIRST | NEXT}", "FOR {UPDATE | NO KEY UPDATE | SHARE | KEY SHARE} [OF]", "INSERT INTO", "VALUES", "SET", "CREATE [OR REPLACE] [TEMP | TEMPORARY] [RECURSIVE] VIEW", "CREATE MATERIALIZED VIEW [IF NOT EXISTS]", "CREATE [GLOBAL | LOCAL] [TEMPORARY | TEMP | UNLOGGED] TABLE [IF NOT EXISTS]", "RETURNING"])
          , qE = C(["UPDATE [ONLY]", "WHERE CURRENT OF", "ON CONFLICT", "DELETE FROM [ONLY]", "DROP TABLE [IF EXISTS]", "ALTER TABLE [IF EXISTS] [ONLY]", "ALTER TABLE ALL IN TABLESPACE", "RENAME [COLUMN]", "RENAME TO", "ADD [COLUMN] [IF NOT EXISTS]", "DROP [COLUMN] [IF EXISTS]", "ALTER [COLUMN]", "[SET DATA] TYPE", "{SET | DROP} DEFAULT", "{SET | DROP} NOT NULL", "TRUNCATE [TABLE] [ONLY]", "SET SCHEMA", "AFTER", "ABORT", "ALTER AGGREGATE", "ALTER COLLATION", "ALTER CONVERSION", "ALTER DATABASE", "ALTER DEFAULT PRIVILEGES", "ALTER DOMAIN", "ALTER EVENT TRIGGER", "ALTER EXTENSION", "ALTER FOREIGN DATA WRAPPER", "ALTER FOREIGN TABLE", "ALTER FUNCTION", "ALTER GROUP", "ALTER INDEX", "ALTER LANGUAGE", "ALTER LARGE OBJECT", "ALTER MATERIALIZED VIEW", "ALTER OPERATOR", "ALTER OPERATOR CLASS", "ALTER OPERATOR FAMILY", "ALTER POLICY", "ALTER PROCEDURE", "ALTER PUBLICATION", "ALTER ROLE", "ALTER ROUTINE", "ALTER RULE", "ALTER SCHEMA", "ALTER SEQUENCE", "ALTER SERVER", "ALTER STATISTICS", "ALTER SUBSCRIPTION", "ALTER SYSTEM", "ALTER TABLESPACE", "ALTER TEXT SEARCH CONFIGURATION", "ALTER TEXT SEARCH DICTIONARY", "ALTER TEXT SEARCH PARSER", "ALTER TEXT SEARCH TEMPLATE", "ALTER TRIGGER", "ALTER TYPE", "ALTER USER", "ALTER USER MAPPING", "ALTER VIEW", "ANALYZE", "BEGIN", "CALL", "CHECKPOINT", "CLOSE", "CLUSTER", "COMMIT", "COMMIT PREPARED", "COPY", "CREATE ACCESS METHOD", "CREATE AGGREGATE", "CREATE CAST", "CREATE COLLATION", "CREATE CONVERSION", "CREATE DATABASE", "CREATE DOMAIN", "CREATE EVENT TRIGGER", "CREATE EXTENSION", "CREATE FOREIGN DATA WRAPPER", "CREATE FOREIGN TABLE", "CREATE FUNCTION", "CREATE GROUP", "CREATE INDEX", "CREATE LANGUAGE", "CREATE OPERATOR", "CREATE OPERATOR CLASS", "CREATE OPERATOR FAMILY", "CREATE POLICY", "CREATE PROCEDURE", "CREATE PUBLICATION", "CREATE ROLE", "CREATE RULE", "CREATE SCHEMA", "CREATE SEQUENCE", "CREATE SERVER", "CREATE STATISTICS", "CREATE SUBSCRIPTION", "CREATE TABLESPACE", "CREATE TEXT SEARCH CONFIGURATION", "CREATE TEXT SEARCH DICTIONARY", "CREATE TEXT SEARCH PARSER", "CREATE TEXT SEARCH TEMPLATE", "CREATE TRANSFORM", "CREATE TRIGGER", "CREATE TYPE", "CREATE USER", "CREATE USER MAPPING", "DEALLOCATE", "DECLARE", "DISCARD", "DROP ACCESS METHOD", "DROP AGGREGATE", "DROP CAST", "DROP COLLATION", "DROP CONVERSION", "DROP DATABASE", "DROP DOMAIN", "DROP EVENT TRIGGER", "DROP EXTENSION", "DROP FOREIGN DATA WRAPPER", "DROP FOREIGN TABLE", "DROP FUNCTION", "DROP GROUP", "DROP INDEX", "DROP LANGUAGE", "DROP MATERIALIZED VIEW", "DROP OPERATOR", "DROP OPERATOR CLASS", "DROP OPERATOR FAMILY", "DROP OWNED", "DROP POLICY", "DROP PROCEDURE", "DROP PUBLICATION", "DROP ROLE", "DROP ROUTINE", "DROP RULE", "DROP SCHEMA", "DROP SEQUENCE", "DROP SERVER", "DROP STATISTICS", "DROP SUBSCRIPTION", "DROP TABLESPACE", "DROP TEXT SEARCH CONFIGURATION", "DROP TEXT SEARCH DICTIONARY", "DROP TEXT SEARCH PARSER", "DROP TEXT SEARCH TEMPLATE", "DROP TRANSFORM", "DROP TRIGGER", "DROP TYPE", "DROP USER", "DROP USER MAPPING", "DROP VIEW", "EXECUTE", "EXPLAIN", "FETCH", "GRANT", "IMPORT FOREIGN SCHEMA", "LISTEN", "LOAD", "LOCK", "MOVE", "NOTIFY", "PREPARE", "PREPARE TRANSACTION", "REASSIGN OWNED", "REFRESH MATERIALIZED VIEW", "REINDEX", "RELEASE SAVEPOINT", "RESET", "REVOKE", "ROLLBACK", "ROLLBACK PREPARED", "ROLLBACK TO SAVEPOINT", "SAVEPOINT", "SECURITY LABEL", "SELECT INTO", "SET CONSTRAINTS", "SET ROLE", "SET SESSION AUTHORIZATION", "SET TRANSACTION", "SHOW", "START TRANSACTION", "UNLISTEN", "VACUUM"])
          , kE = C(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"])
          , jE = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"])
          , zE = C(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE | GROUPS} BETWEEN", "[TIMESTAMP | TIME] {WITH | WITHOUT} TIME ZONE", "IS [NOT] DISTINCT FROM"])
          , ET = {
            name: "postgresql",
            tokenizerOptions: {
                reservedSelect: QE,
                reservedClauses: [...ZE, ...qE],
                reservedSetOperations: kE,
                reservedJoins: jE,
                reservedPhrases: zE,
                reservedKeywords: vE,
                reservedFunctionNames: wE,
                nestedBlockComments: !0,
                extraParens: ["[]"],
                stringTypes: ["$$", {
                    quote: "''-qq",
                    prefixes: ["U&"]
                }, {
                    quote: "''-qq-bs",
                    prefixes: ["E"],
                    requirePrefix: !0
                }, {
                    quote: "''-raw",
                    prefixes: ["B", "X"],
                    requirePrefix: !0
                }],
                identTypes: [{
                    quote: '""-qq',
                    prefixes: ["U&"]
                }],
                identChars: {
                    rest: "$"
                },
                paramTypes: {
                    numbered: ["$"]
                },
                operators: ["%", "^", "|/", "||/", "@", ":=", "&", "|", "#", "~", "<<", ">>", "~>~", "~<~", "~>=~", "~<=~", "@-@", "@@", "##", "<->", "&&", "&<", "&>", "<<|", "&<|", "|>>", "|&>", "<^", "^>", "?#", "?-", "?|", "?-|", "?||", "@>", "<@", "~=", "?", "@?", "?&", "->", "->>", "#>", "#>>", "#-", "=>", ">>=", "<<=", "~~", "~~*", "!~~", "!~~*", "~", "~*", "!~", "!~*", "-|-", "||", "@@@", "!!", "<%", "%>", "<<%", "%>>", "<<->", "<->>", "<<<->", "<->>>", "::", ":"]
            },
            formatOptions: {
                alwaysDenseOperators: ["::", ":"],
                onelineClauses: qE
            }
        }
          , TT = o({
            aggregate: ["ANY_VALUE", "APPROXIMATE PERCENTILE_DISC", "AVG", "COUNT", "LISTAGG", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "STDDEV_SAMP", "STDDEV_POP", "SUM", "VAR_SAMP", "VAR_POP"],
            array: ["array", "array_concat", "array_flatten", "get_array_length", "split_to_array", "subarray"],
            bitwise: ["BIT_AND", "BIT_OR", "BOOL_AND", "BOOL_OR"],
            conditional: ["COALESCE", "DECODE", "GREATEST", "LEAST", "NVL", "NVL2", "NULLIF"],
            dateTime: ["ADD_MONTHS", "AT TIME ZONE", "CONVERT_TIMEZONE", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATE_CMP", "DATE_CMP_TIMESTAMP", "DATE_CMP_TIMESTAMPTZ", "DATE_PART_YEAR", "DATEADD", "DATEDIFF", "DATE_PART", "DATE_TRUNC", "EXTRACT", "GETDATE", "INTERVAL_CMP", "LAST_DAY", "MONTHS_BETWEEN", "NEXT_DAY", "SYSDATE", "TIMEOFDAY", "TIMESTAMP_CMP", "TIMESTAMP_CMP_DATE", "TIMESTAMP_CMP_TIMESTAMPTZ", "TIMESTAMPTZ_CMP", "TIMESTAMPTZ_CMP_DATE", "TIMESTAMPTZ_CMP_TIMESTAMP", "TIMEZONE", "TO_TIMESTAMP", "TRUNC"],
            spatial: ["AddBBox", "DropBBox", "GeometryType", "ST_AddPoint", "ST_Angle", "ST_Area", "ST_AsBinary", "ST_AsEWKB", "ST_AsEWKT", "ST_AsGeoJSON", "ST_AsText", "ST_Azimuth", "ST_Boundary", "ST_Collect", "ST_Contains", "ST_ContainsProperly", "ST_ConvexHull", "ST_CoveredBy", "ST_Covers", "ST_Crosses", "ST_Dimension", "ST_Disjoint", "ST_Distance", "ST_DistanceSphere", "ST_DWithin", "ST_EndPoint", "ST_Envelope", "ST_Equals", "ST_ExteriorRing", "ST_Force2D", "ST_Force3D", "ST_Force3DM", "ST_Force3DZ", "ST_Force4D", "ST_GeometryN", "ST_GeometryType", "ST_GeomFromEWKB", "ST_GeomFromEWKT", "ST_GeomFromText", "ST_GeomFromWKB", "ST_InteriorRingN", "ST_Intersects", "ST_IsPolygonCCW", "ST_IsPolygonCW", "ST_IsClosed", "ST_IsCollection", "ST_IsEmpty", "ST_IsSimple", "ST_IsValid", "ST_Length", "ST_LengthSphere", "ST_Length2D", "ST_LineFromMultiPoint", "ST_LineInterpolatePoint", "ST_M", "ST_MakeEnvelope", "ST_MakeLine", "ST_MakePoint", "ST_MakePolygon", "ST_MemSize", "ST_MMax", "ST_MMin", "ST_Multi", "ST_NDims", "ST_NPoints", "ST_NRings", "ST_NumGeometries", "ST_NumInteriorRings", "ST_NumPoints", "ST_Perimeter", "ST_Perimeter2D", "ST_Point", "ST_PointN", "ST_Points", "ST_Polygon", "ST_RemovePoint", "ST_Reverse", "ST_SetPoint", "ST_SetSRID", "ST_Simplify", "ST_SRID", "ST_StartPoint", "ST_Touches", "ST_Within", "ST_X", "ST_XMax", "ST_XMin", "ST_Y", "ST_YMax", "ST_YMin", "ST_Z", "ST_ZMax", "ST_ZMin", "SupportsBBox"],
            hash: ["CHECKSUM", "FUNC_SHA1", "FNV_HASH", "MD5", "SHA", "SHA1", "SHA2"],
            hyperLogLog: ["HLL", "HLL_CREATE_SKETCH", "HLL_CARDINALITY", "HLL_COMBINE"],
            json: ["IS_VALID_JSON", "IS_VALID_JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_EXTRACT_ARRAY_ELEMENT_TEXT", "JSON_EXTRACT_PATH_TEXT", "JSON_PARSE", "JSON_SERIALIZE"],
            math: ["ABS", "ACOS", "ASIN", "ATAN", "ATAN2", "CBRT", "CEILING", "CEIL", "COS", "COT", "DEGREES", "DEXP", "DLOG1", "DLOG10", "EXP", "FLOOR", "LN", "LOG", "MOD", "PI", "POWER", "RADIANS", "RANDOM", "ROUND", "SIN", "SIGN", "SQRT", "TAN", "TO_HEX", "TRUNC"],
            machineLearning: ["EXPLAIN_MODEL"],
            string: ["ASCII", "BPCHARCMP", "BTRIM", "BTTEXT_PATTERN_CMP", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHARINDEX", "CHR", "COLLATE", "CONCAT", "CRC32", "DIFFERENCE", "INITCAP", "LEFT", "RIGHT", "LEN", "LENGTH", "LOWER", "LPAD", "RPAD", "LTRIM", "OCTETINDEX", "OCTET_LENGTH", "POSITION", "QUOTE_IDENT", "QUOTE_LITERAL", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPEAT", "REPLACE", "REPLICATE", "REVERSE", "RTRIM", "SOUNDEX", "SPLIT_PART", "STRPOS", "STRTOL", "SUBSTRING", "TEXTLEN", "TRANSLATE", "TRIM", "UPPER"],
            superType: ["decimal_precision", "decimal_scale", "is_array", "is_bigint", "is_boolean", "is_char", "is_decimal", "is_float", "is_integer", "is_object", "is_scalar", "is_smallint", "is_varchar", "json_typeof"],
            window: ["AVG", "COUNT", "CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAST_VALUE", "LAG", "LEAD", "LISTAGG", "MAX", "MEDIAN", "MIN", "NTH_VALUE", "NTILE", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "RANK", "RATIO_TO_REPORT", "ROW_NUMBER", "STDDEV_SAMP", "STDDEV_POP", "SUM", "VAR_SAMP", "VAR_POP"],
            dataType: ["CAST", "CONVERT", "TO_CHAR", "TO_DATE", "TO_NUMBER", "TEXT_TO_INT_ALT", "TEXT_TO_NUMERIC_ALT"],
            sysAdmin: ["CHANGE_QUERY_PRIORITY", "CHANGE_SESSION_PRIORITY", "CHANGE_USER_PRIORITY", "CURRENT_SETTING", "PG_CANCEL_BACKEND", "PG_TERMINATE_BACKEND", "REBOOT_CLUSTER", "SET_CONFIG"],
            sysInfo: ["CURRENT_AWS_ACCOUNT", "CURRENT_DATABASE", "CURRENT_NAMESPACE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_USER", "CURRENT_USER_ID", "HAS_ASSUMEROLE_PRIVILEGE", "HAS_DATABASE_PRIVILEGE", "HAS_SCHEMA_PRIVILEGE", "HAS_TABLE_PRIVILEGE", "PG_BACKEND_PID", "PG_GET_COLS", "PG_GET_GRANTEE_BY_IAM_ROLE", "PG_GET_IAM_ROLE_BY_USER", "PG_GET_LATE_BINDING_VIEW_COLS", "PG_LAST_COPY_COUNT", "PG_LAST_COPY_ID", "PG_LAST_UNLOAD_ID", "PG_LAST_QUERY_ID", "PG_LAST_UNLOAD_COUNT", "SESSION_USER", "SLICE_NUM", "USER", "VERSION"],
            dataTypes: ["DECIMAL", "NUMERIC", "CHAR", "CHARACTER", "VARCHAR", "CHARACTER VARYING", "NCHAR", "NVARCHAR", "VARBYTE"]
        })
          , RT = o({
            standard: ["AES128", "AES256", "ALL", "ALLOWOVERWRITE", "ANY", "ARRAY", "AS", "ASC", "AUTHORIZATION", "BACKUP", "BETWEEN", "BINARY", "BOTH", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "CROSS", "DEFAULT", "DEFERRABLE", "DEFLATE", "DEFRAG", "DESC", "DISABLE", "DISTINCT", "DO", "ENABLE", "ENCODE", "ENCRYPT", "ENCRYPTION", "EXPLICIT", "FALSE", "FOR", "FOREIGN", "FREEZE", "FROM", "FULL", "GLOBALDICT256", "GLOBALDICT64K", "GROUP", "IDENTITY", "IGNORE", "ILIKE", "IN", "INITIALLY", "INNER", "INTO", "IS", "ISNULL", "LANGUAGE", "LEADING", "LIKE", "LIMIT", "LOCALTIME", "LOCALTIMESTAMP", "LUN", "LUNS", "MINUS", "NATURAL", "NEW", "NOT", "NOTNULL", "NULL", "NULLS", "OFF", "OFFLINE", "OFFSET", "OID", "OLD", "ON", "ONLY", "OPEN", "ORDER", "OUTER", "OVERLAPS", "PARALLEL", "PARTITION", "PERCENT", "PERMISSIONS", "PLACING", "PRIMARY", "RECOVER", "REFERENCES", "REJECTLOG", "RESORT", "RESPECT", "RESTORE", "SIMILAR", "SNAPSHOT", "SOME", "SYSTEM", "TABLE", "TAG", "TDES", "THEN", "TIMESTAMP", "TO", "TOP", "TRAILING", "TRUE", "UNIQUE", "USING", "VERBOSE", "WALLET", "WITHOUT"],
            dataConversionParams: ["ACCEPTANYDATE", "ACCEPTINVCHARS", "BLANKSASNULL", "DATEFORMAT", "EMPTYASNULL", "ENCODING", "ESCAPE", "EXPLICIT_IDS", "FILLRECORD", "IGNOREBLANKLINES", "IGNOREHEADER", "REMOVEQUOTES", "ROUNDEC", "TIMEFORMAT", "TRIMBLANKS", "TRUNCATECOLUMNS"],
            dataLoadParams: ["COMPROWS", "COMPUPDATE", "MAXERROR", "NOLOAD", "STATUPDATE"],
            dataFormatParams: ["FORMAT", "CSV", "DELIMITER", "FIXEDWIDTH", "SHAPEFILE", "AVRO", "JSON", "PARQUET", "ORC"],
            copyAuthParams: ["ACCESS_KEY_ID", "CREDENTIALS", "ENCRYPTED", "IAM_ROLE", "MASTER_SYMMETRIC_KEY", "SECRET_ACCESS_KEY", "SESSION_TOKEN"],
            copyCompressionParams: ["BZIP2", "GZIP", "LZOP", "ZSTD"],
            copyMiscParams: ["MANIFEST", "READRATIO", "REGION", "SSH"],
            compressionEncodings: ["RAW", "AZ64", "BYTEDICT", "DELTA", "DELTA32K", "LZO", "MOSTLY8", "MOSTLY16", "MOSTLY32", "RUNLENGTH", "TEXT255", "TEXT32K"],
            misc: ["CATALOG_ROLE", "SECRET_ARN", "EXTERNAL", "AUTO", "EVEN", "KEY", "PREDICATE", "COMPRESSION"],
            dataTypes: ["BPCHAR", "TEXT"]
        })
          , AT = C(["SELECT [ALL | DISTINCT]"])
          , ST = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "SET", "CREATE [OR REPLACE | MATERIALIZED] VIEW", "CREATE [TEMPORARY | TEMP | LOCAL TEMPORARY | LOCAL TEMP] TABLE [IF NOT EXISTS]"])
          , NT = C(["UPDATE", "DELETE [FROM]", "DROP TABLE [IF EXISTS]", "ALTER TABLE", "ALTER TABLE APPEND", "ADD [COLUMN]", "DROP [COLUMN]", "RENAME TO", "RENAME COLUMN", "ALTER COLUMN", "TYPE", "ENCODE", "TRUNCATE [TABLE]", "ABORT", "ALTER DATABASE", "ALTER DATASHARE", "ALTER DEFAULT PRIVILEGES", "ALTER GROUP", "ALTER MATERIALIZED VIEW", "ALTER PROCEDURE", "ALTER SCHEMA", "ALTER USER", "ANALYSE", "ANALYZE", "ANALYSE COMPRESSION", "ANALYZE COMPRESSION", "BEGIN", "CALL", "CANCEL", "CLOSE", "COMMIT", "COPY", "CREATE DATABASE", "CREATE DATASHARE", "CREATE EXTERNAL FUNCTION", "CREATE EXTERNAL SCHEMA", "CREATE EXTERNAL TABLE", "CREATE FUNCTION", "CREATE GROUP", "CREATE LIBRARY", "CREATE MODEL", "CREATE PROCEDURE", "CREATE SCHEMA", "CREATE USER", "DEALLOCATE", "DECLARE", "DESC DATASHARE", "DROP DATABASE", "DROP DATASHARE", "DROP FUNCTION", "DROP GROUP", "DROP LIBRARY", "DROP MODEL", "DROP MATERIALIZED VIEW", "DROP PROCEDURE", "DROP SCHEMA", "DROP USER", "DROP VIEW", "DROP", "EXECUTE", "EXPLAIN", "FETCH", "GRANT", "LOCK", "PREPARE", "REFRESH MATERIALIZED VIEW", "RESET", "REVOKE", "ROLLBACK", "SELECT INTO", "SET SESSION AUTHORIZATION", "SET SESSION CHARACTERISTICS", "SHOW", "SHOW EXTERNAL TABLE", "SHOW MODEL", "SHOW DATASHARES", "SHOW PROCEDURE", "SHOW TABLE", "SHOW VIEW", "START TRANSACTION", "UNLOAD", "VACUUM"])
          , OT = C(["UNION [ALL]", "EXCEPT", "INTERSECT", "MINUS"])
          , IT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"])
          , LT = C(["NULL AS", "DATA CATALOG", "HIVE METASTORE", "{ROWS | RANGE} BETWEEN"])
          , CT = {
            name: "redshift",
            tokenizerOptions: {
                reservedSelect: AT,
                reservedClauses: [...ST, ...NT],
                reservedSetOperations: OT,
                reservedJoins: IT,
                reservedPhrases: LT,
                reservedKeywords: RT,
                reservedFunctionNames: TT,
                stringTypes: ["''-qq"],
                identTypes: ['""-qq'],
                identChars: {
                    first: "#"
                },
                paramTypes: {
                    numbered: ["$"]
                },
                operators: ["^", "%", "@", "|/", "||/", "&", "|", "~", "<<", ">>", "||", "::"]
            },
            formatOptions: {
                alwaysDenseOperators: ["::"],
                onelineClauses: NT
            }
        }
          , _T = o({
            all: ["ADD", "AFTER", "ALL", "ALTER", "ANALYZE", "AND", "ANTI", "ANY", "ARCHIVE", "ARRAY", "AS", "ASC", "AT", "AUTHORIZATION", "BETWEEN", "BOTH", "BUCKET", "BUCKETS", "BY", "CACHE", "CASCADE", "CAST", "CHANGE", "CHECK", "CLEAR", "CLUSTER", "CLUSTERED", "CODEGEN", "COLLATE", "COLLECTION", "COLUMN", "COLUMNS", "COMMENT", "COMMIT", "COMPACT", "COMPACTIONS", "COMPUTE", "CONCATENATE", "CONSTRAINT", "COST", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DATA", "DATABASE", "DATABASES", "DAY", "DBPROPERTIES", "DEFINED", "DELETE", "DELIMITED", "DESC", "DESCRIBE", "DFS", "DIRECTORIES", "DIRECTORY", "DISTINCT", "DISTRIBUTE", "DIV", "DROP", "ESCAPE", "ESCAPED", "EXCEPT", "EXCHANGE", "EXISTS", "EXPORT", "EXTENDED", "EXTERNAL", "EXTRACT", "FALSE", "FETCH", "FIELDS", "FILTER", "FILEFORMAT", "FIRST", "FIRST_VALUE", "FOLLOWING", "FOR", "FOREIGN", "FORMAT", "FORMATTED", "FULL", "FUNCTION", "FUNCTIONS", "GLOBAL", "GRANT", "GROUP", "GROUPING", "HOUR", "IF", "IGNORE", "IMPORT", "IN", "INDEX", "INDEXES", "INNER", "INPATH", "INPUTFORMAT", "INTERSECT", "INTERVAL", "INTO", "IS", "ITEMS", "KEYS", "LAST", "LAST_VALUE", "LATERAL", "LAZY", "LEADING", "LEFT", "LIKE", "LINES", "LIST", "LOCAL", "LOCATION", "LOCK", "LOCKS", "LOGICAL", "MACRO", "MAP", "MATCHED", "MERGE", "MINUTE", "MONTH", "MSCK", "NAMESPACE", "NAMESPACES", "NATURAL", "NO", "NOT", "NULL", "NULLS", "OF", "ONLY", "OPTION", "OPTIONS", "OR", "ORDER", "OUT", "OUTER", "OUTPUTFORMAT", "OVER", "OVERLAPS", "OVERLAY", "OVERWRITE", "OWNER", "PARTITION", "PARTITIONED", "PARTITIONS", "PERCENT", "PLACING", "POSITION", "PRECEDING", "PRIMARY", "PRINCIPALS", "PROPERTIES", "PURGE", "QUERY", "RANGE", "RECORDREADER", "RECORDWRITER", "RECOVER", "REDUCE", "REFERENCES", "RENAME", "REPAIR", "REPLACE", "RESPECT", "RESTRICT", "REVOKE", "RIGHT", "RLIKE", "ROLE", "ROLES", "ROLLBACK", "ROLLUP", "ROW", "ROWS", "SCHEMA", "SECOND", "SELECT", "SEMI", "SEPARATED", "SERDE", "SERDEPROPERTIES", "SESSION_USER", "SETS", "SHOW", "SKEWED", "SOME", "SORT", "SORTED", "START", "STATISTICS", "STORED", "STRATIFY", "STRUCT", "SUBSTR", "SUBSTRING", "TABLE", "TABLES", "TBLPROPERTIES", "TEMPORARY", "TERMINATED", "THEN", "TO", "TOUCH", "TRAILING", "TRANSACTION", "TRANSACTIONS", "TRIM", "TRUE", "TRUNCATE", "UNARCHIVE", "UNBOUNDED", "UNCACHE", "UNIQUE", "UNKNOWN", "UNLOCK", "UNSET", "USE", "USER", "USING", "VIEW", "WINDOW", "YEAR", "ANALYSE", "ARRAY_ZIP", "COALESCE", "CONTAINS", "CONVERT", "DAYS", "DAY_HOUR", "DAY_MINUTE", "DAY_SECOND", "DECODE", "DEFAULT", "DISTINCTROW", "ENCODE", "EXPLODE", "EXPLODE_OUTER", "FIXED", "GREATEST", "GROUP_CONCAT", "HOURS", "HOUR_MINUTE", "HOUR_SECOND", "IFNULL", "LEAST", "LEVEL", "MINUTE_SECOND", "NULLIF", "OFFSET", "ON", "OPTIMIZE", "REGEXP", "SEPARATOR", "SIZE", "STRING", "TYPE", "TYPES", "UNSIGNED", "VARIABLES", "YEAR_MONTH"]
        })
          , eT = o({
            aggregate: ["APPROX_COUNT_DISTINCT", "APPROX_PERCENTILE", "AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "BOOL_AND", "BOOL_OR", "COLLECT_LIST", "COLLECT_SET", "CORR", "COUNT", "COUNT", "COUNT", "COUNT_IF", "COUNT_MIN_SKETCH", "COVAR_POP", "COVAR_SAMP", "EVERY", "FIRST", "FIRST_VALUE", "GROUPING", "GROUPING_ID", "KURTOSIS", "LAST", "LAST_VALUE", "MAX", "MAX_BY", "MEAN", "MIN", "MIN_BY", "PERCENTILE", "PERCENTILE", "PERCENTILE_APPROX", "SKEWNESS", "STD", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUM", "VAR_POP", "VAR_SAMP", "VARIANCE"],
            window: ["CUME_DIST", "DENSE_RANK", "LAG", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "RANK", "ROW_NUMBER"],
            array: ["ARRAY", "ARRAY_CONTAINS", "ARRAY_DISTINCT", "ARRAY_EXCEPT", "ARRAY_INTERSECT", "ARRAY_JOIN", "ARRAY_MAX", "ARRAY_MIN", "ARRAY_POSITION", "ARRAY_REMOVE", "ARRAY_REPEAT", "ARRAY_UNION", "ARRAYS_OVERLAP", "ARRAYS_ZIP", "FLATTEN", "SEQUENCE", "SHUFFLE", "SLICE", "SORT_ARRAY"],
            map: ["ELEMENT_AT", "ELEMENT_AT", "MAP", "MAP_CONCAT", "MAP_ENTRIES", "MAP_FROM_ARRAYS", "MAP_FROM_ENTRIES", "MAP_KEYS", "MAP_VALUES", "STR_TO_MAP"],
            datetime: ["ADD_MONTHS", "CURRENT_DATE", "CURRENT_DATE", "CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "DATE_ADD", "DATE_FORMAT", "DATE_FROM_UNIX_DATE", "DATE_PART", "DATE_SUB", "DATE_TRUNC", "DATEDIFF", "DAY", "DAYOFMONTH", "DAYOFWEEK", "DAYOFYEAR", "EXTRACT", "FROM_UNIXTIME", "FROM_UTC_TIMESTAMP", "HOUR", "LAST_DAY", "MAKE_DATE", "MAKE_DT_INTERVAL", "MAKE_INTERVAL", "MAKE_TIMESTAMP", "MAKE_YM_INTERVAL", "MINUTE", "MONTH", "MONTHS_BETWEEN", "NEXT_DAY", "NOW", "QUARTER", "SECOND", "SESSION_WINDOW", "TIMESTAMP_MICROS", "TIMESTAMP_MILLIS", "TIMESTAMP_SECONDS", "TO_DATE", "TO_TIMESTAMP", "TO_UNIX_TIMESTAMP", "TO_UTC_TIMESTAMP", "TRUNC", "UNIX_DATE", "UNIX_MICROS", "UNIX_MILLIS", "UNIX_SECONDS", "UNIX_TIMESTAMP", "WEEKDAY", "WEEKOFYEAR", "WINDOW", "YEAR"],
            json: ["FROM_JSON", "GET_JSON_OBJECT", "JSON_ARRAY_LENGTH", "JSON_OBJECT_KEYS", "JSON_TUPLE", "SCHEMA_OF_JSON", "TO_JSON"],
            misc: ["ABS", "ACOS", "ACOSH", "AGGREGATE", "ARRAY_SORT", "ASCII", "ASIN", "ASINH", "ASSERT_TRUE", "ATAN", "ATAN2", "ATANH", "BASE64", "BIGINT", "BIN", "BINARY", "BIT_COUNT", "BIT_GET", "BIT_LENGTH", "BOOLEAN", "BROUND", "BTRIM", "CARDINALITY", "CBRT", "CEIL", "CEILING", "CHAR", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHR", "CONCAT", "CONCAT_WS", "CONV", "COS", "COSH", "COT", "CRC32", "CURRENT_CATALOG", "CURRENT_DATABASE", "CURRENT_USER", "DATE", "DECIMAL", "DEGREES", "DOUBLE", "ELT", "EXP", "EXPM1", "FACTORIAL", "FIND_IN_SET", "FLOAT", "FLOOR", "FORALL", "FORMAT_NUMBER", "FORMAT_STRING", "FROM_CSV", "GETBIT", "HASH", "HEX", "HYPOT", "INITCAP", "INLINE", "INLINE_OUTER", "INPUT_FILE_BLOCK_LENGTH", "INPUT_FILE_BLOCK_START", "INPUT_FILE_NAME", "INSTR", "INT", "ISNAN", "ISNOTNULL", "ISNULL", "JAVA_METHOD", "LCASE", "LEFT", "LENGTH", "LEVENSHTEIN", "LN", "LOCATE", "LOG", "LOG10", "LOG1P", "LOG2", "LOWER", "LPAD", "LTRIM", "MAP_FILTER", "MAP_ZIP_WITH", "MD5", "MOD", "MONOTONICALLY_INCREASING_ID", "NAMED_STRUCT", "NANVL", "NEGATIVE", "NVL", "NVL2", "OCTET_LENGTH", "OVERLAY", "PARSE_URL", "PI", "PMOD", "POSEXPLODE", "POSEXPLODE_OUTER", "POSITION", "POSITIVE", "POW", "POWER", "PRINTF", "RADIANS", "RAISE_ERROR", "RAND", "RANDN", "RANDOM", "REFLECT", "REGEXP_EXTRACT", "REGEXP_EXTRACT_ALL", "REGEXP_LIKE", "REGEXP_REPLACE", "REPEAT", "REPLACE", "REVERSE", "RIGHT", "RINT", "ROUND", "RPAD", "RTRIM", "SCHEMA_OF_CSV", "SENTENCES", "SHA", "SHA1", "SHA2", "SHIFTLEFT", "SHIFTRIGHT", "SHIFTRIGHTUNSIGNED", "SIGN", "SIGNUM", "SIN", "SINH", "SMALLINT", "SOUNDEX", "SPACE", "SPARK_PARTITION_ID", "SPLIT", "SQRT", "STACK", "SUBSTR", "SUBSTRING", "SUBSTRING_INDEX", "TAN", "TANH", "TIMESTAMP", "TINYINT", "TO_CSV", "TRANSFORM_KEYS", "TRANSFORM_VALUES", "TRANSLATE", "TRIM", "TRY_ADD", "TRY_DIVIDE", "TYPEOF", "UCASE", "UNBASE64", "UNHEX", "UPPER", "UUID", "VERSION", "WIDTH_BUCKET", "XPATH", "XPATH_BOOLEAN", "XPATH_DOUBLE", "XPATH_FLOAT", "XPATH_INT", "XPATH_LONG", "XPATH_NUMBER", "XPATH_SHORT", "XPATH_STRING", "XXHASH64", "ZIP_WITH"],
            cast: ["CAST"],
            caseAbbrev: ["COALESCE", "NULLIF"],
            dataTypes: ["DECIMAL", "DEC", "NUMERIC", "VARCHAR"]
        })
          , PT = C(["SELECT [ALL | DISTINCT]"])
          , DT = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "SORT BY", "CLUSTER BY", "DISTRIBUTE BY", "LIMIT", "INSERT [INTO | OVERWRITE] [TABLE]", "VALUES", "INSERT OVERWRITE [LOCAL] DIRECTORY", "LOAD DATA [LOCAL] INPATH", "[OVERWRITE] INTO TABLE", "CREATE [OR REPLACE] [GLOBAL TEMPORARY | TEMPORARY] VIEW [IF NOT EXISTS]", "CREATE [EXTERNAL] TABLE [IF NOT EXISTS]"])
          , sT = C(["DROP TABLE [IF EXISTS]", "ALTER TABLE", "ADD COLUMNS", "DROP {COLUMN | COLUMNS}", "RENAME TO", "RENAME COLUMN", "ALTER COLUMN", "TRUNCATE TABLE", "LATERAL VIEW", "ALTER DATABASE", "ALTER VIEW", "CREATE DATABASE", "CREATE FUNCTION", "DROP DATABASE", "DROP FUNCTION", "DROP VIEW", "REPAIR TABLE", "USE DATABASE", "TABLESAMPLE", "PIVOT", "TRANSFORM", "EXPLAIN", "ADD FILE", "ADD JAR", "ANALYZE TABLE", "CACHE TABLE", "CLEAR CACHE", "DESCRIBE DATABASE", "DESCRIBE FUNCTION", "DESCRIBE QUERY", "DESCRIBE TABLE", "LIST FILE", "LIST JAR", "REFRESH", "REFRESH TABLE", "REFRESH FUNCTION", "RESET", "SHOW COLUMNS", "SHOW CREATE TABLE", "SHOW DATABASES", "SHOW FUNCTIONS", "SHOW PARTITIONS", "SHOW TABLE EXTENDED", "SHOW TABLES", "SHOW TBLPROPERTIES", "SHOW VIEWS", "UNCACHE TABLE"])
          , MT = C(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"])
          , UT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN", "[LEFT] {ANTI | SEMI} JOIN", "NATURAL [LEFT] {ANTI | SEMI} JOIN"])
          , tT = C(["ON DELETE", "ON UPDATE", "CURRENT ROW", "{ROWS | RANGE} BETWEEN"])
          , rT = {
            name: "spark",
            tokenizerOptions: {
                reservedSelect: PT,
                reservedClauses: [...DT, ...sT],
                reservedSetOperations: MT,
                reservedJoins: UT,
                reservedPhrases: tT,
                supportsXor: !0,
                reservedKeywords: _T,
                reservedFunctionNames: eT,
                extraParens: ["[]"],
                stringTypes: ["''-bs", '""-bs', {
                    quote: "''-raw",
                    prefixes: ["R", "X"],
                    requirePrefix: !0
                }, {
                    quote: '""-raw',
                    prefixes: ["R", "X"],
                    requirePrefix: !0
                }],
                identTypes: ["``"],
                variableTypes: [{
                    quote: "{}",
                    prefixes: ["$"],
                    requirePrefix: !0
                }],
                operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||", "->"],
                postProcess: function(T) {
                    return T.map(((R,A)=>{
                        const S = T[A - 1] || N
                          , O = T[A + 1] || N;
                        return I.WINDOW(R) && O.type === E.OPEN_PAREN ? Object.assign(Object.assign({}, R), {
                            type: E.RESERVED_FUNCTION_NAME
                        }) : "ITEMS" !== R.text || R.type !== E.RESERVED_KEYWORD || "COLLECTION" === S.text && "TERMINATED" === O.text ? R : Object.assign(Object.assign({}, R), {
                            type: E.IDENTIFIER,
                            text: R.raw
                        })
                    }
                    ))
                }
            },
            formatOptions: {
                onelineClauses: sT
            }
        }
          , GT = o({
            scalar: ["ABS", "CHANGES", "CHAR", "COALESCE", "FORMAT", "GLOB", "HEX", "IFNULL", "IIF", "INSTR", "LAST_INSERT_ROWID", "LENGTH", "LIKE", "LIKELIHOOD", "LIKELY", "LOAD_EXTENSION", "LOWER", "LTRIM", "NULLIF", "PRINTF", "QUOTE", "RANDOM", "RANDOMBLOB", "REPLACE", "ROUND", "RTRIM", "SIGN", "SOUNDEX", "SQLITE_COMPILEOPTION_GET", "SQLITE_COMPILEOPTION_USED", "SQLITE_OFFSET", "SQLITE_SOURCE_ID", "SQLITE_VERSION", "SUBSTR", "SUBSTRING", "TOTAL_CHANGES", "TRIM", "TYPEOF", "UNICODE", "UNLIKELY", "UPPER", "ZEROBLOB"],
            aggregate: ["AVG", "COUNT", "GROUP_CONCAT", "MAX", "MIN", "SUM", "TOTAL"],
            datetime: ["DATE", "TIME", "DATETIME", "JULIANDAY", "UNIXEPOCH", "STRFTIME"],
            window: ["row_number", "rank", "dense_rank", "percent_rank", "cume_dist", "ntile", "lag", "lead", "first_value", "last_value", "nth_value"],
            math: ["ACOS", "ACOSH", "ASIN", "ASINH", "ATAN", "ATAN2", "ATANH", "CEIL", "CEILING", "COS", "COSH", "DEGREES", "EXP", "FLOOR", "LN", "LOG", "LOG", "LOG10", "LOG2", "MOD", "PI", "POW", "POWER", "RADIANS", "SIN", "SINH", "SQRT", "TAN", "TANH", "TRUNC"],
            json: ["JSON", "JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_ARRAY_LENGTH", "JSON_EXTRACT", "JSON_INSERT", "JSON_OBJECT", "JSON_PATCH", "JSON_REMOVE", "JSON_REPLACE", "JSON_SET", "JSON_TYPE", "JSON_TYPE", "JSON_VALID", "JSON_QUOTE", "JSON_GROUP_ARRAY", "JSON_GROUP_OBJECT", "JSON_EACH", "JSON_TREE"],
            cast: ["CAST"],
            dataTypes: ["CHARACTER", "VARCHAR", "VARYING CHARACTER", "NCHAR", "NATIVE CHARACTER", "NVARCHAR", "NUMERIC", "DECIMAL"]
        })
          , nT = o({
            all: ["ABORT", "ACTION", "ADD", "AFTER", "ALL", "ALTER", "AND", "ANY", "ARE", "ARRAY", "ALWAYS", "ANALYZE", "AS", "ASC", "ATTACH", "AUTOINCREMENT", "BEFORE", "BEGIN", "BETWEEN", "BY", "CASCADE", "CASE", "CAST", "CHECK", "COLLATE", "COLUMN", "COMMIT", "CONFLICT", "CONSTRAINT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATABASE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DETACH", "DISTINCT", "DO", "DROP", "EACH", "ELSE", "END", "ESCAPE", "EXCEPT", "EXCLUDE", "EXCLUSIVE", "EXISTS", "EXPLAIN", "FAIL", "FILTER", "FIRST", "FOLLOWING", "FOR", "FOREIGN", "FROM", "FULL", "GENERATED", "GLOB", "GROUP", "GROUPS", "HAVING", "IF", "IGNORE", "IMMEDIATE", "IN", "INDEX", "INDEXED", "INITIALLY", "INNER", "INSERT", "INSTEAD", "INTERSECT", "INTO", "IS", "ISNULL", "JOIN", "KEY", "LAST", "LEFT", "LIKE", "LIMIT", "MATCH", "MATERIALIZED", "NATURAL", "NO", "NOT", "NOTHING", "NOTNULL", "NULL", "NULLS", "OF", "OFFSET", "ON", "ONLY", "OPEN", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARTITION", "PLAN", "PRAGMA", "PRECEDING", "PRIMARY", "QUERY", "RAISE", "RANGE", "RECURSIVE", "REFERENCES", "REGEXP", "REINDEX", "RELEASE", "RENAME", "REPLACE", "RESTRICT", "RETURNING", "RIGHT", "ROLLBACK", "ROW", "ROWS", "SAVEPOINT", "SELECT", "SET", "TABLE", "TEMP", "TEMPORARY", "THEN", "TIES", "TO", "TRANSACTION", "TRIGGER", "UNBOUNDED", "UNION", "UNIQUE", "UPDATE", "USING", "VACUUM", "VALUES", "VIEW", "VIRTUAL", "WHEN", "WHERE", "WINDOW", "WITH", "WITHOUT"]
        })
          , iT = C(["SELECT [ALL | DISTINCT]"])
          , aT = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "INSERT [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK] INTO", "REPLACE INTO", "VALUES", "SET", "CREATE [TEMPORARY | TEMP] VIEW [IF NOT EXISTS]", "CREATE [TEMPORARY | TEMP] TABLE [IF NOT EXISTS]"])
          , oT = C(["UPDATE [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK]", "ON CONFLICT", "DELETE FROM", "DROP TABLE [IF EXISTS]", "ALTER TABLE", "ADD [COLUMN]", "DROP [COLUMN]", "RENAME [COLUMN]", "RENAME TO", "SET SCHEMA"])
          , HT = C(["UNION [ALL]", "EXCEPT", "INTERSECT"])
          , BT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"])
          , FT = C(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE | GROUPS} BETWEEN"])
          , YT = {
            name: "sqlite",
            tokenizerOptions: {
                reservedSelect: iT,
                reservedClauses: [...aT, ...oT],
                reservedSetOperations: HT,
                reservedJoins: BT,
                reservedPhrases: FT,
                reservedKeywords: nT,
                reservedFunctionNames: GT,
                stringTypes: ["''-qq", {
                    quote: "''-raw",
                    prefixes: ["X"],
                    requirePrefix: !0
                }],
                identTypes: ['""-qq', "``", "[]"],
                paramTypes: {
                    positional: !0,
                    numbered: ["?"],
                    named: [":", "@", "$"]
                },
                operators: ["%", "~", "&", "|", "<<", ">>", "==", "->", "->>", "||"]
            },
            formatOptions: {
                onelineClauses: oT
            }
        }
          , lT = o({
            set: ["GROUPING"],
            window: ["RANK", "DENSE_RANK", "PERCENT_RANK", "CUME_DIST", "ROW_NUMBER"],
            numeric: ["POSITION", "OCCURRENCES_REGEX", "POSITION_REGEX", "EXTRACT", "CHAR_LENGTH", "CHARACTER_LENGTH", "OCTET_LENGTH", "CARDINALITY", "ABS", "MOD", "LN", "EXP", "POWER", "SQRT", "FLOOR", "CEIL", "CEILING", "WIDTH_BUCKET"],
            string: ["SUBSTRING", "SUBSTRING_REGEX", "UPPER", "LOWER", "CONVERT", "TRANSLATE", "TRANSLATE_REGEX", "TRIM", "OVERLAY", "NORMALIZE", "SPECIFICTYPE"],
            datetime: ["CURRENT_DATE", "CURRENT_TIME", "LOCALTIME", "CURRENT_TIMESTAMP", "LOCALTIMESTAMP"],
            aggregate: ["COUNT", "AVG", "MAX", "MIN", "SUM", "STDDEV_POP", "STDDEV_SAMP", "VAR_SAMP", "VAR_POP", "COLLECT", "FUSION", "INTERSECTION", "COVAR_POP", "COVAR_SAMP", "CORR", "REGR_SLOPE", "REGR_INTERCEPT", "REGR_COUNT", "REGR_R2", "REGR_AVGX", "REGR_AVGY", "REGR_SXX", "REGR_SYY", "REGR_SXY", "PERCENTILE_CONT", "PERCENTILE_DISC"],
            cast: ["CAST"],
            caseAbbrev: ["COALESCE", "NULLIF"],
            nonStandard: ["ROUND", "SIN", "COS", "TAN", "ASIN", "ACOS", "ATAN"],
            dataTypes: ["CHARACTER", "CHAR", "CHARACTER VARYING", "CHAR VARYING", "VARCHAR", "CHARACTER LARGE OBJECT", "CHAR LARGE OBJECT", "CLOB", "NATIONAL CHARACTER", "NATIONAL CHAR", "NCHAR", "NATIONAL CHARACTER VARYING", "NATIONAL CHAR VARYING", "NCHAR VARYING", "NATIONAL CHARACTER LARGE OBJECT", "NCHAR LARGE OBJECT", "NCLOB", "BINARY", "BINARY VARYING", "VARBINARY", "BINARY LARGE OBJECT", "BLOB", "NUMERIC", "DECIMAL", "DEC", "TIME", "TIMESTAMP"]
        })
          , VT = o({
            all: ["ALL", "ALLOCATE", "ALTER", "ANY", "ARE", "ARRAY", "AS", "ASENSITIVE", "ASYMMETRIC", "AT", "ATOMIC", "AUTHORIZATION", "BEGIN", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOOLEAN", "BOTH", "BY", "CALL", "CALLED", "CASCADED", "CAST", "CHAR", "CHARACTER", "CHECK", "CLOB", "CLOSE", "COALESCE", "COLLATE", "COLUMN", "COMMIT", "CONDITION", "CONNECT", "CONSTRAINT", "CORRESPONDING", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_CATALOG", "CURRENT_DEFAULT_TRANSFORM_GROUP", "CURRENT_PATH", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_TRANSFORM_GROUP_FOR_TYPE", "CURRENT_USER", "CURSOR", "CYCLE", "DATE", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELETE", "DEREF", "DESCRIBE", "DETERMINISTIC", "DISCONNECT", "DISTINCT", "DOUBLE", "DROP", "DYNAMIC", "EACH", "ELEMENT", "END-EXEC", "ESCAPE", "EVERY", "EXCEPT", "EXEC", "EXECUTE", "EXISTS", "EXTERNAL", "FALSE", "FETCH", "FILTER", "FLOAT", "FOR", "FOREIGN", "FREE", "FROM", "FULL", "FUNCTION", "GET", "GLOBAL", "GRANT", "GROUP", "HAVING", "HOLD", "HOUR", "IDENTITY", "IN", "INDICATOR", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "IS", "LANGUAGE", "LARGE", "LATERAL", "LEADING", "LEFT", "LIKE", "LIKE_REGEX", "LOCAL", "MATCH", "MEMBER", "MERGE", "METHOD", "MINUTE", "MODIFIES", "MODULE", "MONTH", "MULTISET", "NATIONAL", "NATURAL", "NCHAR", "NCLOB", "NEW", "NO", "NONE", "NOT", "NULL", "NULLIF", "NUMERIC", "OF", "OLD", "ON", "ONLY", "OPEN", "ORDER", "OUT", "OUTER", "OVER", "OVERLAPS", "PARAMETER", "PARTITION", "PRECISION", "PREPARE", "PRIMARY", "PROCEDURE", "RANGE", "READS", "REAL", "RECURSIVE", "REF", "REFERENCES", "REFERENCING", "RELEASE", "RESULT", "RETURN", "RETURNS", "REVOKE", "RIGHT", "ROLLBACK", "ROLLUP", "ROW", "ROWS", "SAVEPOINT", "SCOPE", "SCROLL", "SEARCH", "SECOND", "SELECT", "SENSITIVE", "SESSION_USER", "SET", "SIMILAR", "SMALLINT", "SOME", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "START", "STATIC", "SUBMULTISET", "SYMMETRIC", "SYSTEM", "SYSTEM_USER", "TABLE", "TABLESAMPLE", "THEN", "TIME", "TIMESTAMP", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO", "TRAILING", "TRANSLATION", "TREAT", "TRIGGER", "TRUE", "UESCAPE", "UNION", "UNIQUE", "UNKNOWN", "UNNEST", "UPDATE", "USER", "USING", "VALUE", "VALUES", "VARBINARY", "VARCHAR", "VARYING", "WHENEVER", "WINDOW", "WITHIN", "WITHOUT", "YEAR"]
        })
          , pT = C(["SELECT [ALL | DISTINCT]"])
          , WT = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY [ALL | DISTINCT]", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "FETCH {FIRST | NEXT}", "INSERT INTO", "VALUES", "SET", "CREATE [RECURSIVE] VIEW", "CREATE [GLOBAL TEMPORARY | LOCAL TEMPORARY] TABLE"])
          , XT = C(["UPDATE", "WHERE CURRENT OF", "DELETE FROM", "DROP TABLE", "ALTER TABLE", "ADD COLUMN", "DROP [COLUMN]", "RENAME COLUMN", "RENAME TO", "ALTER [COLUMN]", "{SET | DROP} DEFAULT", "ADD SCOPE", "DROP SCOPE {CASCADE | RESTRICT}", "RESTART WITH", "TRUNCATE TABLE", "SET SCHEMA"])
          , cT = C(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"])
          , mT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"])
          , uT = C(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE} BETWEEN"])
          , hT = {
            name: "sql",
            tokenizerOptions: {
                reservedSelect: pT,
                reservedClauses: [...WT, ...XT],
                reservedSetOperations: cT,
                reservedJoins: mT,
                reservedPhrases: uT,
                reservedKeywords: VT,
                reservedFunctionNames: lT,
                stringTypes: [{
                    quote: "''-qq-bs",
                    prefixes: ["N", "U&"]
                }, {
                    quote: "''-raw",
                    prefixes: ["X"],
                    requirePrefix: !0
                }],
                identTypes: ['""-qq', "``"],
                paramTypes: {
                    positional: !0
                },
                operators: ["||"]
            },
            formatOptions: {
                onelineClauses: XT
            }
        }
          , dT = o({
            all: ["ABS", "ACOS", "ALL_MATCH", "ANY_MATCH", "APPROX_DISTINCT", "APPROX_MOST_FREQUENT", "APPROX_PERCENTILE", "APPROX_SET", "ARBITRARY", "ARRAYS_OVERLAP", "ARRAY_AGG", "ARRAY_DISTINCT", "ARRAY_EXCEPT", "ARRAY_INTERSECT", "ARRAY_JOIN", "ARRAY_MAX", "ARRAY_MIN", "ARRAY_POSITION", "ARRAY_REMOVE", "ARRAY_SORT", "ARRAY_UNION", "ASIN", "ATAN", "ATAN2", "AT_TIMEZONE", "AVG", "BAR", "BETA_CDF", "BING_TILE", "BING_TILES_AROUND", "BING_TILE_AT", "BING_TILE_COORDINATES", "BING_TILE_POLYGON", "BING_TILE_QUADKEY", "BING_TILE_ZOOM_LEVEL", "BITWISE_AND", "BITWISE_AND_AGG", "BITWISE_LEFT_SHIFT", "BITWISE_NOT", "BITWISE_OR", "BITWISE_OR_AGG", "BITWISE_RIGHT_SHIFT", "BITWISE_RIGHT_SHIFT_ARITHMETIC", "BITWISE_XOR", "BIT_COUNT", "BOOL_AND", "BOOL_OR", "CARDINALITY", "CAST", "CBRT", "CEIL", "CEILING", "CHAR2HEXINT", "CHECKSUM", "CHR", "CLASSIFY", "COALESCE", "CODEPOINT", "COLOR", "COMBINATIONS", "CONCAT", "CONCAT_WS", "CONTAINS", "CONTAINS_SEQUENCE", "CONVEX_HULL_AGG", "CORR", "COS", "COSH", "COSINE_SIMILARITY", "COUNT", "COUNT_IF", "COVAR_POP", "COVAR_SAMP", "CRC32", "CUME_DIST", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_GROUPS", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_USER", "DATE", "DATE_ADD", "DATE_DIFF", "DATE_FORMAT", "DATE_PARSE", "DATE_TRUNC", "DAY", "DAY_OF_MONTH", "DAY_OF_WEEK", "DAY_OF_YEAR", "DEGREES", "DENSE_RANK", "DOW", "DOY", "E", "ELEMENT_AT", "EMPTY_APPROX_SET", "EVALUATE_CLASSIFIER_PREDICTIONS", "EVERY", "EXP", "EXTRACT", "FEATURES", "FILTER", "FIRST_VALUE", "FLATTEN", "FLOOR", "FORMAT", "FORMAT_DATETIME", "FORMAT_NUMBER", "FROM_BASE", "FROM_BASE32", "FROM_BASE64", "FROM_BASE64URL", "FROM_BIG_ENDIAN_32", "FROM_BIG_ENDIAN_64", "FROM_ENCODED_POLYLINE", "FROM_GEOJSON_GEOMETRY", "FROM_HEX", "FROM_IEEE754_32", "FROM_IEEE754_64", "FROM_ISO8601_DATE", "FROM_ISO8601_TIMESTAMP", "FROM_ISO8601_TIMESTAMP_NANOS", "FROM_UNIXTIME", "FROM_UNIXTIME_NANOS", "FROM_UTF8", "GEOMETRIC_MEAN", "GEOMETRY_FROM_HADOOP_SHAPE", "GEOMETRY_INVALID_REASON", "GEOMETRY_NEAREST_POINTS", "GEOMETRY_TO_BING_TILES", "GEOMETRY_UNION", "GEOMETRY_UNION_AGG", "GREATEST", "GREAT_CIRCLE_DISTANCE", "HAMMING_DISTANCE", "HASH_COUNTS", "HISTOGRAM", "HMAC_MD5", "HMAC_SHA1", "HMAC_SHA256", "HMAC_SHA512", "HOUR", "HUMAN_READABLE_SECONDS", "IF", "INDEX", "INFINITY", "INTERSECTION_CARDINALITY", "INVERSE_BETA_CDF", "INVERSE_NORMAL_CDF", "IS_FINITE", "IS_INFINITE", "IS_JSON_SCALAR", "IS_NAN", "JACCARD_INDEX", "JSON_ARRAY_CONTAINS", "JSON_ARRAY_GET", "JSON_ARRAY_LENGTH", "JSON_EXISTS", "JSON_EXTRACT", "JSON_EXTRACT_SCALAR", "JSON_FORMAT", "JSON_PARSE", "JSON_QUERY", "JSON_SIZE", "JSON_VALUE", "KURTOSIS", "LAG", "LAST_DAY_OF_MONTH", "LAST_VALUE", "LEAD", "LEARN_CLASSIFIER", "LEARN_LIBSVM_CLASSIFIER", "LEARN_LIBSVM_REGRESSOR", "LEARN_REGRESSOR", "LEAST", "LENGTH", "LEVENSHTEIN_DISTANCE", "LINE_INTERPOLATE_POINT", "LINE_INTERPOLATE_POINTS", "LINE_LOCATE_POINT", "LISTAGG", "LN", "LOCALTIME", "LOCALTIMESTAMP", "LOG", "LOG10", "LOG2", "LOWER", "LPAD", "LTRIM", "LUHN_CHECK", "MAKE_SET_DIGEST", "MAP", "MAP_AGG", "MAP_CONCAT", "MAP_ENTRIES", "MAP_FILTER", "MAP_FROM_ENTRIES", "MAP_KEYS", "MAP_UNION", "MAP_VALUES", "MAP_ZIP_WITH", "MAX", "MAX_BY", "MD5", "MERGE", "MERGE_SET_DIGEST", "MILLISECOND", "MIN", "MINUTE", "MIN_BY", "MOD", "MONTH", "MULTIMAP_AGG", "MULTIMAP_FROM_ENTRIES", "MURMUR3", "NAN", "NGRAMS", "NONE_MATCH", "NORMALIZE", "NORMAL_CDF", "NOW", "NTH_VALUE", "NTILE", "NULLIF", "NUMERIC_HISTOGRAM", "OBJECTID", "OBJECTID_TIMESTAMP", "PARSE_DATA_SIZE", "PARSE_DATETIME", "PARSE_DURATION", "PERCENT_RANK", "PI", "POSITION", "POW", "POWER", "QDIGEST_AGG", "QUARTER", "RADIANS", "RAND", "RANDOM", "RANK", "REDUCE", "REDUCE_AGG", "REGEXP_COUNT", "REGEXP_EXTRACT", "REGEXP_EXTRACT_ALL", "REGEXP_LIKE", "REGEXP_POSITION", "REGEXP_REPLACE", "REGEXP_SPLIT", "REGRESS", "REGR_INTERCEPT", "REGR_SLOPE", "RENDER", "REPEAT", "REPLACE", "REVERSE", "RGB", "ROUND", "ROW_NUMBER", "RPAD", "RTRIM", "SECOND", "SEQUENCE", "SHA1", "SHA256", "SHA512", "SHUFFLE", "SIGN", "SIMPLIFY_GEOMETRY", "SIN", "SKEWNESS", "SLICE", "SOUNDEX", "SPATIAL_PARTITIONING", "SPATIAL_PARTITIONS", "SPLIT", "SPLIT_PART", "SPLIT_TO_MAP", "SPLIT_TO_MULTIMAP", "SPOOKY_HASH_V2_32", "SPOOKY_HASH_V2_64", "SQRT", "STARTS_WITH", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STRPOS", "ST_AREA", "ST_ASBINARY", "ST_ASTEXT", "ST_BOUNDARY", "ST_BUFFER", "ST_CENTROID", "ST_CONTAINS", "ST_CONVEXHULL", "ST_COORDDIM", "ST_CROSSES", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_ENDPOINT", "ST_ENVELOPE", "ST_ENVELOPEASPTS", "ST_EQUALS", "ST_EXTERIORRING", "ST_GEOMETRIES", "ST_GEOMETRYFROMTEXT", "ST_GEOMETRYN", "ST_GEOMETRYTYPE", "ST_GEOMFROMBINARY", "ST_INTERIORRINGN", "ST_INTERIORRINGS", "ST_INTERSECTION", "ST_INTERSECTS", "ST_ISCLOSED", "ST_ISEMPTY", "ST_ISRING", "ST_ISSIMPLE", "ST_ISVALID", "ST_LENGTH", "ST_LINEFROMTEXT", "ST_LINESTRING", "ST_MULTIPOINT", "ST_NUMGEOMETRIES", "ST_NUMINTERIORRING", "ST_NUMPOINTS", "ST_OVERLAPS", "ST_POINT", "ST_POINTN", "ST_POINTS", "ST_POLYGON", "ST_RELATE", "ST_STARTPOINT", "ST_SYMDIFFERENCE", "ST_TOUCHES", "ST_UNION", "ST_WITHIN", "ST_X", "ST_XMAX", "ST_XMIN", "ST_Y", "ST_YMAX", "ST_YMIN", "SUBSTR", "SUBSTRING", "SUM", "TAN", "TANH", "TDIGEST_AGG", "TIMESTAMP_OBJECTID", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO_BASE", "TO_BASE32", "TO_BASE64", "TO_BASE64URL", "TO_BIG_ENDIAN_32", "TO_BIG_ENDIAN_64", "TO_CHAR", "TO_DATE", "TO_ENCODED_POLYLINE", "TO_GEOJSON_GEOMETRY", "TO_GEOMETRY", "TO_HEX", "TO_IEEE754_32", "TO_IEEE754_64", "TO_ISO8601", "TO_MILLISECONDS", "TO_SPHERICAL_GEOGRAPHY", "TO_TIMESTAMP", "TO_UNIXTIME", "TO_UTF8", "TRANSFORM", "TRANSFORM_KEYS", "TRANSFORM_VALUES", "TRANSLATE", "TRIM", "TRIM_ARRAY", "TRUNCATE", "TRY", "TRY_CAST", "TYPEOF", "UPPER", "URL_DECODE", "URL_ENCODE", "URL_EXTRACT_FRAGMENT", "URL_EXTRACT_HOST", "URL_EXTRACT_PARAMETER", "URL_EXTRACT_PATH", "URL_EXTRACT_PORT", "URL_EXTRACT_PROTOCOL", "URL_EXTRACT_QUERY", "UUID", "VALUES_AT_QUANTILES", "VALUE_AT_QUANTILE", "VARIANCE", "VAR_POP", "VAR_SAMP", "VERSION", "WEEK", "WEEK_OF_YEAR", "WIDTH_BUCKET", "WILSON_INTERVAL_LOWER", "WILSON_INTERVAL_UPPER", "WITH_TIMEZONE", "WORD_STEM", "XXHASH64", "YEAR", "YEAR_OF_WEEK", "YOW", "ZIP", "ZIP_WITH"],
            rowPattern: ["CLASSIFIER", "FIRST", "LAST", "MATCH_NUMBER", "NEXT", "PERMUTE", "PREV"]
        })
          , KT = o({
            all: ["ABSENT", "ADD", "ADMIN", "AFTER", "ALL", "ALTER", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "AT", "AUTHORIZATION", "BERNOULLI", "BETWEEN", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CATALOGS", "COLUMN", "COLUMNS", "COMMENT", "COMMIT", "COMMITTED", "CONDITIONAL", "CONSTRAINT", "COPARTITION", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_PATH", "CURRENT_ROLE", "DATA", "DEALLOCATE", "DEFAULT", "DEFINE", "DEFINER", "DELETE", "DENY", "DESC", "DESCRIBE", "DESCRIPTOR", "DISTINCT", "DISTRIBUTED", "DOUBLE", "DROP", "ELSE", "EMPTY", "ENCODING", "END", "ERROR", "ESCAPE", "EXCEPT", "EXCLUDING", "EXECUTE", "EXISTS", "EXPLAIN", "FALSE", "FETCH", "FINAL", "FIRST", "FOLLOWING", "FOR", "FROM", "FULL", "FUNCTIONS", "GRANT", "GRANTED", "GRANTS", "GRAPHVIZ", "GROUP", "GROUPING", "GROUPS", "HAVING", "IGNORE", "IN", "INCLUDING", "INITIAL", "INNER", "INPUT", "INSERT", "INTERSECT", "INTERVAL", "INTO", "INVOKER", "IO", "IS", "ISOLATION", "JOIN", "JSON", "JSON_ARRAY", "JSON_OBJECT", "KEEP", "KEY", "KEYS", "LAST", "LATERAL", "LEADING", "LEFT", "LEVEL", "LIKE", "LIMIT", "LOCAL", "LOGICAL", "MATCH", "MATCHED", "MATCHES", "MATCH_RECOGNIZE", "MATERIALIZED", "MEASURES", "NATURAL", "NEXT", "NFC", "NFD", "NFKC", "NFKD", "NO", "NONE", "NOT", "NULL", "NULLS", "OBJECT", "OF", "OFFSET", "OMIT", "ON", "ONE", "ONLY", "OPTION", "OR", "ORDER", "ORDINALITY", "OUTER", "OUTPUT", "OVER", "OVERFLOW", "PARTITION", "PARTITIONS", "PASSING", "PAST", "PATH", "PATTERN", "PER", "PERMUTE", "PRECEDING", "PRECISION", "PREPARE", "PRIVILEGES", "PROPERTIES", "PRUNE", "QUOTES", "RANGE", "READ", "RECURSIVE", "REFRESH", "RENAME", "REPEATABLE", "RESET", "RESPECT", "RESTRICT", "RETURNING", "REVOKE", "RIGHT", "ROLE", "ROLES", "ROLLBACK", "ROLLUP", "ROW", "ROWS", "RUNNING", "SCALAR", "SCHEMA", "SCHEMAS", "SECURITY", "SEEK", "SELECT", "SERIALIZABLE", "SESSION", "SET", "SETS", "SHOW", "SKIP", "SOME", "START", "STATS", "STRING", "SUBSET", "SYSTEM", "TABLE", "TABLES", "TABLESAMPLE", "TEXT", "THEN", "TIES", "TIME", "TIMESTAMP", "TO", "TRAILING", "TRANSACTION", "TRUE", "TYPE", "UESCAPE", "UNBOUNDED", "UNCOMMITTED", "UNCONDITIONAL", "UNION", "UNIQUE", "UNKNOWN", "UNMATCHED", "UNNEST", "UPDATE", "USE", "USER", "USING", "UTF16", "UTF32", "UTF8", "VALIDATE", "VALUE", "VALUES", "VERBOSE", "VIEW", "WHEN", "WHERE", "WINDOW", "WITH", "WITHIN", "WITHOUT", "WORK", "WRAPPER", "WRITE", "ZONE"],
            types: ["BIGINT", "INT", "INTEGER", "SMALLINT", "TINYINT", "BOOLEAN", "DATE", "DECIMAL", "REAL", "DOUBLE", "HYPERLOGLOG", "QDIGEST", "TDIGEST", "P4HYPERLOGLOG", "INTERVAL", "TIMESTAMP", "TIME", "VARBINARY", "VARCHAR", "CHAR", "ROW", "ARRAY", "MAP", "JSON", "JSON2016", "IPADDRESS", "GEOMETRY", "UUID", "SETDIGEST", "JONIREGEXP", "RE2JREGEXP", "LIKEPATTERN", "COLOR", "CODEPOINTS", "FUNCTION", "JSONPATH"]
        })
          , yT = C(["SELECT [ALL | DISTINCT]"])
          , fT = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY [ALL | DISTINCT]", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "FETCH {FIRST | NEXT}", "INSERT INTO", "VALUES", "SET", "CREATE [OR REPLACE] [MATERIALIZED] VIEW", "CREATE TABLE [IF NOT EXISTS]", "MATCH_RECOGNIZE", "MEASURES", "ONE ROW PER MATCH", "ALL ROWS PER MATCH", "AFTER MATCH", "PATTERN", "SUBSET", "DEFINE"])
          , bT = C(["UPDATE", "DELETE FROM", "DROP TABLE [IF EXISTS]", "ALTER TABLE [IF EXISTS]", "ADD COLUMN [IF NOT EXISTS]", "DROP COLUMN [IF EXISTS]", "RENAME COLUMN [IF EXISTS]", "RENAME TO", "SET AUTHORIZATION [USER | ROLE]", "SET PROPERTIES", "EXECUTE", "TRUNCATE TABLE", "ALTER SCHEMA", "ALTER MATERIALIZED VIEW", "ALTER VIEW", "CREATE SCHEMA", "CREATE ROLE", "DROP SCHEMA", "DROP MATERIALIZED VIEW", "DROP VIEW", "DROP ROLE", "EXPLAIN", "ANALYZE", "EXPLAIN ANALYZE", "EXPLAIN ANALYZE VERBOSE", "USE", "DESCRIBE INPUT", "DESCRIBE OUTPUT", "REFRESH MATERIALIZED VIEW", "RESET SESSION", "SET SESSION", "SET PATH", "SET TIME ZONE", "SHOW GRANTS", "SHOW CREATE TABLE", "SHOW CREATE SCHEMA", "SHOW CREATE VIEW", "SHOW CREATE MATERIALIZED VIEW", "SHOW TABLES", "SHOW SCHEMAS", "SHOW CATALOGS", "SHOW COLUMNS", "SHOW STATS FOR", "SHOW ROLES", "SHOW CURRENT ROLES", "SHOW ROLE GRANTS", "SHOW FUNCTIONS", "SHOW SESSION"])
          , xT = C(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"])
          , JT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"])
          , gT = C(["{ROWS | RANGE | GROUPS} BETWEEN", "IS [NOT] DISTINCT FROM"])
          , $T = {
            name: "trino",
            tokenizerOptions: {
                reservedSelect: yT,
                reservedClauses: [...fT, ...bT],
                reservedSetOperations: xT,
                reservedJoins: JT,
                reservedPhrases: gT,
                reservedKeywords: KT,
                reservedFunctionNames: dT,
                extraParens: ["[]", "{}"],
                stringTypes: [{
                    quote: "''-qq",
                    prefixes: ["U&"]
                }, {
                    quote: "''-raw",
                    prefixes: ["X"],
                    requirePrefix: !0
                }],
                identTypes: ['""-qq'],
                paramTypes: {
                    positional: !0
                },
                operators: ["%", "->", "=>", ":", "||", "|", "^", "$"]
            },
            formatOptions: {
                onelineClauses: bT
            }
        }
          , wT = o({
            aggregate: ["APPROX_COUNT_DISTINCT", "AVG", "CHECKSUM_AGG", "COUNT", "COUNT_BIG", "GROUPING", "GROUPING_ID", "MAX", "MIN", "STDEV", "STDEVP", "SUM", "VAR", "VARP"],
            analytic: ["CUME_DIST", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "Collation - COLLATIONPROPERTY", "Collation - TERTIARY_WEIGHTS"],
            configuration: ["@@DBTS", "@@LANGID", "@@LANGUAGE", "@@LOCK_TIMEOUT", "@@MAX_CONNECTIONS", "@@MAX_PRECISION", "@@NESTLEVEL", "@@OPTIONS", "@@REMSERVER", "@@SERVERNAME", "@@SERVICENAME", "@@SPID", "@@TEXTSIZE", "@@VERSION"],
            conversion: ["CAST", "CONVERT", "PARSE", "TRY_CAST", "TRY_CONVERT", "TRY_PARSE"],
            cryptographic: ["ASYMKEY_ID", "ASYMKEYPROPERTY", "CERTPROPERTY", "CERT_ID", "CRYPT_GEN_RANDOM", "DECRYPTBYASYMKEY", "DECRYPTBYCERT", "DECRYPTBYKEY", "DECRYPTBYKEYAUTOASYMKEY", "DECRYPTBYKEYAUTOCERT", "DECRYPTBYPASSPHRASE", "ENCRYPTBYASYMKEY", "ENCRYPTBYCERT", "ENCRYPTBYKEY", "ENCRYPTBYPASSPHRASE", "HASHBYTES", "IS_OBJECTSIGNED", "KEY_GUID", "KEY_ID", "KEY_NAME", "SIGNBYASYMKEY", "SIGNBYCERT", "SYMKEYPROPERTY", "VERIFYSIGNEDBYCERT", "VERIFYSIGNEDBYASYMKEY"],
            cursor: ["@@CURSOR_ROWS", "@@FETCH_STATUS", "CURSOR_STATUS"],
            dataType: ["DATALENGTH", "IDENT_CURRENT", "IDENT_INCR", "IDENT_SEED", "IDENTITY", "SQL_VARIANT_PROPERTY"],
            datetime: ["@@DATEFIRST", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_TIMEZONE_ID", "DATEADD", "DATEDIFF", "DATEDIFF_BIG", "DATEFROMPARTS", "DATENAME", "DATEPART", "DATETIME2FROMPARTS", "DATETIMEFROMPARTS", "DATETIMEOFFSETFROMPARTS", "DAY", "EOMONTH", "GETDATE", "GETUTCDATE", "ISDATE", "MONTH", "SMALLDATETIMEFROMPARTS", "SWITCHOFFSET", "SYSDATETIME", "SYSDATETIMEOFFSET", "SYSUTCDATETIME", "TIMEFROMPARTS", "TODATETIMEOFFSET", "YEAR", "JSON", "ISJSON", "JSON_VALUE", "JSON_QUERY", "JSON_MODIFY"],
            mathematical: ["ABS", "ACOS", "ASIN", "ATAN", "ATN2", "CEILING", "COS", "COT", "DEGREES", "EXP", "FLOOR", "LOG", "LOG10", "PI", "POWER", "RADIANS", "RAND", "ROUND", "SIGN", "SIN", "SQRT", "SQUARE", "TAN", "CHOOSE", "GREATEST", "IIF", "LEAST"],
            metadata: ["@@PROCID", "APP_NAME", "APPLOCK_MODE", "APPLOCK_TEST", "ASSEMBLYPROPERTY", "COL_LENGTH", "COL_NAME", "COLUMNPROPERTY", "DATABASEPROPERTYEX", "DB_ID", "DB_NAME", "FILE_ID", "FILE_IDEX", "FILE_NAME", "FILEGROUP_ID", "FILEGROUP_NAME", "FILEGROUPPROPERTY", "FILEPROPERTY", "FILEPROPERTYEX", "FULLTEXTCATALOGPROPERTY", "FULLTEXTSERVICEPROPERTY", "INDEX_COL", "INDEXKEY_PROPERTY", "INDEXPROPERTY", "NEXT VALUE FOR", "OBJECT_DEFINITION", "OBJECT_ID", "OBJECT_NAME", "OBJECT_SCHEMA_NAME", "OBJECTPROPERTY", "OBJECTPROPERTYEX", "ORIGINAL_DB_NAME", "PARSENAME", "SCHEMA_ID", "SCHEMA_NAME", "SCOPE_IDENTITY", "SERVERPROPERTY", "STATS_DATE", "TYPE_ID", "TYPE_NAME", "TYPEPROPERTY"],
            ranking: ["DENSE_RANK", "NTILE", "RANK", "ROW_NUMBER", "PUBLISHINGSERVERNAME"],
            security: ["CERTENCODED", "CERTPRIVATEKEY", "CURRENT_USER", "DATABASE_PRINCIPAL_ID", "HAS_DBACCESS", "HAS_PERMS_BY_NAME", "IS_MEMBER", "IS_ROLEMEMBER", "IS_SRVROLEMEMBER", "LOGINPROPERTY", "ORIGINAL_LOGIN", "PERMISSIONS", "PWDENCRYPT", "PWDCOMPARE", "SESSION_USER", "SESSIONPROPERTY", "SUSER_ID", "SUSER_NAME", "SUSER_SID", "SUSER_SNAME", "SYSTEM_USER", "USER", "USER_ID", "USER_NAME"],
            string: ["ASCII", "CHAR", "CHARINDEX", "CONCAT", "CONCAT_WS", "DIFFERENCE", "FORMAT", "LEFT", "LEN", "LOWER", "LTRIM", "NCHAR", "PATINDEX", "QUOTENAME", "REPLACE", "REPLICATE", "REVERSE", "RIGHT", "RTRIM", "SOUNDEX", "SPACE", "STR", "STRING_AGG", "STRING_ESCAPE", "STUFF", "SUBSTRING", "TRANSLATE", "TRIM", "UNICODE", "UPPER"],
            system: ["$PARTITION", "@@ERROR", "@@IDENTITY", "@@PACK_RECEIVED", "@@ROWCOUNT", "@@TRANCOUNT", "BINARY_CHECKSUM", "CHECKSUM", "COMPRESS", "CONNECTIONPROPERTY", "CONTEXT_INFO", "CURRENT_REQUEST_ID", "CURRENT_TRANSACTION_ID", "DECOMPRESS", "ERROR_LINE", "ERROR_MESSAGE", "ERROR_NUMBER", "ERROR_PROCEDURE", "ERROR_SEVERITY", "ERROR_STATE", "FORMATMESSAGE", "GET_FILESTREAM_TRANSACTION_CONTEXT", "GETANSINULL", "HOST_ID", "HOST_NAME", "ISNULL", "ISNUMERIC", "MIN_ACTIVE_ROWVERSION", "NEWID", "NEWSEQUENTIALID", "ROWCOUNT_BIG", "SESSION_CONTEXT", "XACT_STATE"],
            statistical: ["@@CONNECTIONS", "@@CPU_BUSY", "@@IDLE", "@@IO_BUSY", "@@PACK_SENT", "@@PACKET_ERRORS", "@@TIMETICKS", "@@TOTAL_ERRORS", "@@TOTAL_READ", "@@TOTAL_WRITE", "TEXTPTR", "TEXTVALID"],
            trigger: ["COLUMNS_UPDATED", "EVENTDATA", "TRIGGER_NESTLEVEL", "UPDATE"],
            caseAbbrev: ["COALESCE", "NULLIF"],
            dataTypes: ["DECIMAL", "NUMERIC", "FLOAT", "REAL", "DATETIME2", "DATETIMEOFFSET", "TIME", "CHAR", "VARCHAR", "NCHAR", "NVARCHAR", "BINARY", "VARBINARY"]
        })
          , vT = o({
            standard: ["ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "AUTHORIZATION", "BACKUP", "BEGIN", "BETWEEN", "BREAK", "BROWSE", "BULK", "BY", "CASCADE", "CHECK", "CHECKPOINT", "CLOSE", "CLUSTERED", "COALESCE", "COLLATE", "COLUMN", "COMMIT", "COMPUTE", "CONSTRAINT", "CONTAINS", "CONTAINSTABLE", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DBCC", "DEALLOCATE", "DECLARE", "DEFAULT", "DELETE", "DENY", "DESC", "DISK", "DISTINCT", "DISTRIBUTED", "DOUBLE", "DROP", "DUMP", "ERRLVL", "ESCAPE", "EXEC", "EXECUTE", "EXISTS", "EXIT", "EXTERNAL", "FETCH", "FILE", "FILLFACTOR", "FOR", "FOREIGN", "FREETEXT", "FREETEXTTABLE", "FROM", "FULL", "FUNCTION", "GOTO", "GRANT", "GROUP", "HAVING", "HOLDLOCK", "IDENTITY", "IDENTITYCOL", "IDENTITY_INSERT", "IF", "IN", "INDEX", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JOIN", "KEY", "KILL", "LEFT", "LIKE", "LINENO", "LOAD", "MERGE", "NATIONAL", "NOCHECK", "NONCLUSTERED", "NOT", "NULL", "NULLIF", "OF", "OFF", "OFFSETS", "ON", "OPEN", "OPENDATASOURCE", "OPENQUERY", "OPENROWSET", "OPENXML", "OPTION", "OR", "ORDER", "OUTER", "OVER", "PERCENT", "PIVOT", "PLAN", "PRECISION", "PRIMARY", "PRINT", "PROC", "PROCEDURE", "PUBLIC", "RAISERROR", "READ", "READTEXT", "RECONFIGURE", "REFERENCES", "REPLICATION", "RESTORE", "RESTRICT", "RETURN", "REVERT", "REVOKE", "RIGHT", "ROLLBACK", "ROWCOUNT", "ROWGUIDCOL", "RULE", "SAVE", "SCHEMA", "SECURITYAUDIT", "SELECT", "SEMANTICKEYPHRASETABLE", "SEMANTICSIMILARITYDETAILSTABLE", "SEMANTICSIMILARITYTABLE", "SESSION_USER", "SET", "SETUSER", "SHUTDOWN", "SOME", "STATISTICS", "SYSTEM_USER", "TABLE", "TABLESAMPLE", "TEXTSIZE", "THEN", "TO", "TOP", "TRAN", "TRANSACTION", "TRIGGER", "TRUNCATE", "TRY_CONVERT", "TSEQUAL", "UNION", "UNIQUE", "UNPIVOT", "UPDATE", "UPDATETEXT", "USE", "USER", "VALUES", "VARYING", "VIEW", "WAITFOR", "WHERE", "WHILE", "WITH", "WITHIN GROUP", "WRITETEXT"],
            odbc: ["ABSOLUTE", "ACTION", "ADA", "ADD", "ALL", "ALLOCATE", "ALTER", "AND", "ANY", "ARE", "AS", "ASC", "ASSERTION", "AT", "AUTHORIZATION", "AVG", "BEGIN", "BETWEEN", "BIT", "BIT_LENGTH", "BOTH", "BY", "CASCADE", "CASCADED", "CAST", "CATALOG", "CHAR", "CHARACTER", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHECK", "CLOSE", "COALESCE", "COLLATE", "COLLATION", "COLUMN", "COMMIT", "CONNECT", "CONNECTION", "CONSTRAINT", "CONSTRAINTS", "CONTINUE", "CONVERT", "CORRESPONDING", "COUNT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATE", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DESCRIBE", "DESCRIPTOR", "DIAGNOSTICS", "DISCONNECT", "DISTINCT", "DOMAIN", "DOUBLE", "DROP", "END-EXEC", "ESCAPE", "EXCEPTION", "EXEC", "EXECUTE", "EXISTS", "EXTERNAL", "EXTRACT", "FALSE", "FETCH", "FIRST", "FLOAT", "FOR", "FOREIGN", "FORTRAN", "FOUND", "FROM", "FULL", "GET", "GLOBAL", "GO", "GOTO", "GRANT", "GROUP", "HAVING", "HOUR", "IDENTITY", "IMMEDIATE", "IN", "INCLUDE", "INDEX", "INDICATOR", "INITIALLY", "INNER", "INPUT", "INSENSITIVE", "INSERT", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "IS", "ISOLATION", "JOIN", "KEY", "LANGUAGE", "LAST", "LEADING", "LEFT", "LEVEL", "LIKE", "LOCAL", "LOWER", "MATCH", "MAX", "MIN", "MINUTE", "MODULE", "MONTH", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NEXT", "NO", "NONE", "NOT", "NULL", "NULLIF", "NUMERIC", "OCTET_LENGTH", "OF", "ONLY", "OPEN", "OPTION", "OR", "ORDER", "OUTER", "OUTPUT", "OVERLAPS", "PAD", "PARTIAL", "PASCAL", "POSITION", "PRECISION", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVILEGES", "PROCEDURE", "PUBLIC", "READ", "REAL", "REFERENCES", "RELATIVE", "RESTRICT", "REVOKE", "RIGHT", "ROLLBACK", "ROWS", "SCHEMA", "SCROLL", "SECOND", "SECTION", "SELECT", "SESSION", "SESSION_USER", "SET", "SIZE", "SMALLINT", "SOME", "SPACE", "SQL", "SQLCA", "SQLCODE", "SQLERROR", "SQLSTATE", "SQLWARNING", "SUBSTRING", "SUM", "SYSTEM_USER", "TABLE", "TEMPORARY", "TIME", "TIMESTAMP", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO", "TRAILING", "TRANSACTION", "TRANSLATE", "TRANSLATION", "TRIM", "TRUE", "UNION", "UNIQUE", "UNKNOWN", "UPDATE", "UPPER", "USAGE", "USER", "VALUE", "VALUES", "VARCHAR", "VARYING", "VIEW", "WHENEVER", "WHERE", "WITH", "WORK", "WRITE", "YEAR", "ZONE"]
        })
          , QT = C(["SELECT [ALL | DISTINCT]"])
          , ZT = C(["WITH", "INTO", "FROM", "WHERE", "GROUP BY", "HAVING", "WINDOW", "PARTITION BY", "ORDER BY", "OFFSET", "FETCH {FIRST | NEXT}", "INSERT [INTO]", "VALUES", "SET", "MERGE [INTO]", "WHEN [NOT] MATCHED [BY TARGET | BY SOURCE] [THEN]", "UPDATE SET", "CREATE [OR ALTER] [MATERIALIZED] VIEW", "CREATE TABLE", "CREATE [OR ALTER] {PROC | PROCEDURE}"])
          , qT = C(["UPDATE", "WHERE CURRENT OF", "DELETE [FROM]", "DROP TABLE [IF EXISTS]", "ALTER TABLE", "ADD", "DROP COLUMN [IF EXISTS]", "ALTER COLUMN", "TRUNCATE TABLE", "ADD SENSITIVITY CLASSIFICATION", "ADD SIGNATURE", "AGGREGATE", "ANSI_DEFAULTS", "ANSI_NULLS", "ANSI_NULL_DFLT_OFF", "ANSI_NULL_DFLT_ON", "ANSI_PADDING", "ANSI_WARNINGS", "APPLICATION ROLE", "ARITHABORT", "ARITHIGNORE", "ASSEMBLY", "ASYMMETRIC KEY", "AUTHORIZATION", "AVAILABILITY GROUP", "BACKUP", "BACKUP CERTIFICATE", "BACKUP MASTER KEY", "BACKUP SERVICE MASTER KEY", "BEGIN CONVERSATION TIMER", "BEGIN DIALOG CONVERSATION", "BROKER PRIORITY", "BULK INSERT", "CERTIFICATE", "CLOSE MASTER KEY", "CLOSE SYMMETRIC KEY", "COLLATE", "COLUMN ENCRYPTION KEY", "COLUMN MASTER KEY", "COLUMNSTORE INDEX", "CONCAT_NULL_YIELDS_NULL", "CONTEXT_INFO", "CONTRACT", "CREDENTIAL", "CRYPTOGRAPHIC PROVIDER", "CURSOR_CLOSE_ON_COMMIT", "DATABASE", "DATABASE AUDIT SPECIFICATION", "DATABASE ENCRYPTION KEY", "DATABASE HADR", "DATABASE SCOPED CONFIGURATION", "DATABASE SCOPED CREDENTIAL", "DATABASE SET", "DATEFIRST", "DATEFORMAT", "DEADLOCK_PRIORITY", "DENY", "DENY XML", "DISABLE TRIGGER", "ENABLE TRIGGER", "END CONVERSATION", "ENDPOINT", "EVENT NOTIFICATION", "EVENT SESSION", "EXECUTE AS", "EXTERNAL DATA SOURCE", "EXTERNAL FILE FORMAT", "EXTERNAL LANGUAGE", "EXTERNAL LIBRARY", "EXTERNAL RESOURCE POOL", "EXTERNAL TABLE", "FIPS_FLAGGER", "FMTONLY", "FORCEPLAN", "FULLTEXT CATALOG", "FULLTEXT INDEX", "FULLTEXT STOPLIST", "FUNCTION", "GET CONVERSATION GROUP", "GET_TRANSMISSION_STATUS", "GRANT", "GRANT XML", "IDENTITY_INSERT", "IMPLICIT_TRANSACTIONS", "INDEX", "LANGUAGE", "LOCK_TIMEOUT", "LOGIN", "MASTER KEY", "MESSAGE TYPE", "MOVE CONVERSATION", "NOCOUNT", "NOEXEC", "NUMERIC_ROUNDABORT", "OFFSETS", "OPEN MASTER KEY", "OPEN SYMMETRIC KEY", "PARSEONLY", "PARTITION FUNCTION", "PARTITION SCHEME", "PROCEDURE", "QUERY_GOVERNOR_COST_LIMIT", "QUEUE", "QUOTED_IDENTIFIER", "RECEIVE", "REMOTE SERVICE BINDING", "REMOTE_PROC_TRANSACTIONS", "RESOURCE GOVERNOR", "RESOURCE POOL", "RESTORE", "RESTORE FILELISTONLY", "RESTORE HEADERONLY", "RESTORE LABELONLY", "RESTORE MASTER KEY", "RESTORE REWINDONLY", "RESTORE SERVICE MASTER KEY", "RESTORE VERIFYONLY", "REVERT", "REVOKE", "REVOKE XML", "ROLE", "ROUTE", "ROWCOUNT", "RULE", "SCHEMA", "SEARCH PROPERTY LIST", "SECURITY POLICY", "SELECTIVE XML INDEX", "SEND", "SENSITIVITY CLASSIFICATION", "SEQUENCE", "SERVER AUDIT", "SERVER AUDIT SPECIFICATION", "SERVER CONFIGURATION", "SERVER ROLE", "SERVICE", "SERVICE MASTER KEY", "SETUSER", "SHOWPLAN_ALL", "SHOWPLAN_TEXT", "SHOWPLAN_XML", "SIGNATURE", "SPATIAL INDEX", "STATISTICS", "STATISTICS IO", "STATISTICS PROFILE", "STATISTICS TIME", "STATISTICS XML", "SYMMETRIC KEY", "SYNONYM", "TABLE", "TABLE IDENTITY", "TEXTSIZE", "TRANSACTION ISOLATION LEVEL", "TRIGGER", "TYPE", "UPDATE STATISTICS", "USER", "WORKLOAD GROUP", "XACT_ABORT", "XML INDEX", "XML SCHEMA COLLECTION"])
          , kT = C(["UNION [ALL]", "EXCEPT", "INTERSECT"])
          , jT = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "{CROSS | OUTER} APPLY"])
          , zT = C(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE} BETWEEN"])
          , ER = {
            name: "transactsql",
            tokenizerOptions: {
                reservedSelect: QT,
                reservedClauses: [...ZT, ...qT],
                reservedSetOperations: kT,
                reservedJoins: jT,
                reservedPhrases: zT,
                reservedKeywords: vT,
                reservedFunctionNames: wT,
                nestedBlockComments: !0,
                stringTypes: [{
                    quote: "''-qq",
                    prefixes: ["N"]
                }],
                identTypes: ['""-qq', "[]"],
                identChars: {
                    first: "#@",
                    rest: "#@$"
                },
                paramTypes: {
                    named: ["@"],
                    quoted: ["@"]
                },
                operators: ["%", "&", "|", "^", "~", "!<", "!>", "+=", "-=", "*=", "/=", "%=", "|=", "&=", "^=", "::", ":"]
            },
            formatOptions: {
                alwaysDenseOperators: ["::"],
                onelineClauses: qT
            }
        }
          , TR = o({
            reserved: ["ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "_BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "ENCLOSED", "ESCAPED", "EXCEPT", "EXISTS", "EXIT", "EXPLAIN", "EXTRA_JOIN", "FALSE", "FETCH", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FORCE_COMPILED_MODE", "FORCE_INTERPRETER_MODE", "FOREIGN", "FROM", "FULL", "FULLTEXT", "GRANT", "GROUP", "HAVING", "HEARTBEAT_NO_LOGGING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "IN", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "_INTERNAL_DYNAMIC_TYPECAST", "INTERSECT", "INTERVAL", "INTO", "ITERATE", "JOIN", "KEY", "KEYS", "KILL", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUS", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NO_QUERY_REWRITE", "NOT", "NO_WRITE_TO_BINLOG", "NO_QUERY_REWRITE", "NULL", "NUMERIC", "ON", "OPTIMIZE", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "OVER", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "READ", "READS", "REAL", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RIGHT_ANTI_JOIN", "RIGHT_SEMI_JOIN", "RIGHT_STRAIGHT_JOIN", "RLIKE", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SEMI_JOIN", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQL_BIG_RESULT", "SQL_BUFFER_RESULT", "SQL_CACHE", "SQL_CALC_FOUND_ROWS", "SQLEXCEPTION", "SQL_NO_CACHE", "SQL_NO_LOGGING", "SQL_SMALL_RESULT", "SQLSTATE", "SQLWARNING", "STRAIGHT_JOIN", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNBOUNDED", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "_UTF8", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH", "WITHIN", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL"]
        })
          , RR = o({
            all: ["ABS", "ACOS", "ADDDATE", "ADDTIME", "AES_DECRYPT", "AES_ENCRYPT", "ANY_VALUE", "APPROX_COUNT_DISTINCT", "APPROX_COUNT_DISTINCT_ACCUMULATE", "APPROX_COUNT_DISTINCT_COMBINE", "APPROX_COUNT_DISTINCT_ESTIMATE", "APPROX_GEOGRAPHY_INTERSECTS", "APPROX_PERCENTILE", "ASCII", "ASIN", "ATAN", "ATAN2", "AVG", "BIN", "BINARY", "BIT_AND", "BIT_COUNT", "BIT_OR", "BIT_XOR", "CAST", "CEIL", "CEILING", "CHAR", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHARSET", "COALESCE", "COERCIBILITY", "COLLATION", "COLLECT", "CONCAT", "CONCAT_WS", "CONNECTION_ID", "CONV", "CONVERT", "CONVERT_TZ", "COS", "COT", "COUNT", "CUME_DIST", "CURDATE", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURTIME", "DATABASE", "DATE", "DATE_ADD", "DATEDIFF", "DATE_FORMAT", "DATE_SUB", "DATE_TRUNC", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFWEEK", "DAYOFYEAR", "DECODE", "DEFAULT", "DEGREES", "DENSE_RANK", "DIV", "DOT_PRODUCT", "ELT", "EUCLIDEAN_DISTANCE", "EXP", "EXTRACT", "FIELD", "FIRST", "FIRST_VALUE", "FLOOR", "FORMAT", "FOUND_ROWS", "FROM_BASE64", "FROM_DAYS", "FROM_UNIXTIME", "GEOGRAPHY_AREA", "GEOGRAPHY_CONTAINS", "GEOGRAPHY_DISTANCE", "GEOGRAPHY_INTERSECTS", "GEOGRAPHY_LATITUDE", "GEOGRAPHY_LENGTH", "GEOGRAPHY_LONGITUDE", "GEOGRAPHY_POINT", "GEOGRAPHY_WITHIN_DISTANCE", "GEOMETRY_AREA", "GEOMETRY_CONTAINS", "GEOMETRY_DISTANCE", "GEOMETRY_FILTER", "GEOMETRY_INTERSECTS", "GEOMETRY_LENGTH", "GEOMETRY_POINT", "GEOMETRY_WITHIN_DISTANCE", "GEOMETRY_X", "GEOMETRY_Y", "GREATEST", "GROUPING", "GROUP_CONCAT", "HEX", "HIGHLIGHT", "HOUR", "ICU_VERSION", "IF", "IFNULL", "INET_ATON", "INET_NTOA", "INET6_ATON", "INET6_NTOA", "INITCAP", "INSERT", "INSTR", "INTERVAL", "IS", "IS NULL", "JSON_AGG", "JSON_ARRAY_CONTAINS_DOUBLE", "JSON_ARRAY_CONTAINS_JSON", "JSON_ARRAY_CONTAINS_STRING", "JSON_ARRAY_PUSH_DOUBLE", "JSON_ARRAY_PUSH_JSON", "JSON_ARRAY_PUSH_STRING", "JSON_DELETE_KEY", "JSON_EXTRACT_DOUBLE", "JSON_EXTRACT_JSON", "JSON_EXTRACT_STRING", "JSON_EXTRACT_BIGINT", "JSON_GET_TYPE", "JSON_LENGTH", "JSON_SET_DOUBLE", "JSON_SET_JSON", "JSON_SET_STRING", "JSON_SPLICE_DOUBLE", "JSON_SPLICE_JSON", "JSON_SPLICE_STRING", "LAG", "LAST_DAY", "LAST_VALUE", "LCASE", "LEAD", "LEAST", "LEFT", "LENGTH", "LIKE", "LN", "LOCALTIME", "LOCALTIMESTAMP", "LOCATE", "LOG", "LOG10", "LOG2", "LPAD", "LTRIM", "MATCH", "MAX", "MD5", "MEDIAN", "MICROSECOND", "MIN", "MINUTE", "MOD", "MONTH", "MONTHNAME", "MONTHS_BETWEEN", "NOT", "NOW", "NTH_VALUE", "NTILE", "NULLIF", "OCTET_LENGTH", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "PI", "PIVOT", "POSITION", "POW", "POWER", "QUARTER", "QUOTE", "RADIANS", "RAND", "RANK", "REGEXP", "REPEAT", "REPLACE", "REVERSE", "RIGHT", "RLIKE", "ROUND", "ROW_COUNT", "ROW_NUMBER", "RPAD", "RTRIM", "SCALAR", "SCHEMA", "SEC_TO_TIME", "SHA1", "SHA2", "SIGMOID", "SIGN", "SIN", "SLEEP", "SPLIT", "SOUNDEX", "SOUNDS LIKE", "SOURCE_POS_WAIT", "SPACE", "SQRT", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STR_TO_DATE", "SUBDATE", "SUBSTR", "SUBSTRING", "SUBSTRING_INDEX", "SUM", "SYS_GUID", "TAN", "TIME", "TIMEDIFF", "TIME_BUCKET", "TIME_FORMAT", "TIMESTAMP", "TIMESTAMPADD", "TIMESTAMPDIFF", "TIME_TO_SEC", "TO_BASE64", "TO_CHAR", "TO_DAYS", "TO_JSON", "TO_NUMBER", "TO_SECONDS", "TO_TIMESTAMP", "TRIM", "TRUNC", "TRUNCATE", "UCASE", "UNHEX", "UNIX_TIMESTAMP", "UPDATEXML", "UPPER", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "UUID", "VALUES", "VARIANCE", "VAR_POP", "VAR_SAMP", "VECTOR_SUB", "VERSION", "WEEK", "WEEKDAY", "WEEKOFYEAR", "YEAR", "BIT", "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "INTEGER", "BIGINT", "DECIMAL", "DEC", "NUMERIC", "FIXED", "FLOAT", "DOUBLE", "DOUBLE PRECISION", "REAL", "DATETIME", "TIMESTAMP", "TIME", "YEAR", "CHAR", "NATIONAL CHAR", "VARCHAR", "NATIONAL VARCHAR", "BINARY", "VARBINARY", "BLOB", "TEXT", "ENUM"]
        })
          , AR = C(["SELECT [ALL | DISTINCT | DISTINCTROW]"])
          , SR = C(["WITH", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER BY", "LIMIT", "OFFSET", "INSERT [IGNORE] [INTO]", "VALUES", "REPLACE [INTO]", "ON DUPLICATE KEY UPDATE", "SET", "CREATE VIEW", "CREATE [ROWSTORE] [REFERENCE | TEMPORARY | GLOBAL TEMPORARY] TABLE [IF NOT EXISTS]", "CREATE [OR REPLACE] [TEMPORARY] PROCEDURE [IF NOT EXISTS]", "CREATE [OR REPLACE] [EXTERNAL] FUNCTION"])
          , NR = C(["UPDATE", "DELETE [FROM]", "DROP [TEMPORARY] TABLE [IF EXISTS]", "ALTER [ONLINE] TABLE", "ADD [COLUMN]", "ADD [UNIQUE] {INDEX | KEY}", "DROP [COLUMN]", "MODIFY [COLUMN]", "CHANGE", "RENAME [TO | AS]", "TRUNCATE [TABLE]", "ADD AGGREGATOR", "ADD LEAF", "AGGREGATOR SET AS MASTER", "ALTER DATABASE", "ALTER PIPELINE", "ALTER RESOURCE POOL", "ALTER USER", "ALTER VIEW", "ANALYZE TABLE", "ATTACH DATABASE", "ATTACH LEAF", "ATTACH LEAF ALL", "BACKUP DATABASE", "BINLOG", "BOOTSTRAP AGGREGATOR", "CACHE INDEX", "CALL", "CHANGE", "CHANGE MASTER TO", "CHANGE REPLICATION FILTER", "CHANGE REPLICATION SOURCE TO", "CHECK BLOB CHECKSUM", "CHECK TABLE", "CHECKSUM TABLE", "CLEAR ORPHAN DATABASES", "CLONE", "COMMIT", "CREATE DATABASE", "CREATE GROUP", "CREATE INDEX", "CREATE LINK", "CREATE MILESTONE", "CREATE PIPELINE", "CREATE RESOURCE POOL", "CREATE ROLE", "CREATE USER", "DEALLOCATE PREPARE", "DESCRIBE", "DETACH DATABASE", "DETACH PIPELINE", "DROP DATABASE", "DROP FUNCTION", "DROP INDEX", "DROP LINK", "DROP PIPELINE", "DROP PROCEDURE", "DROP RESOURCE POOL", "DROP ROLE", "DROP USER", "DROP VIEW", "EXECUTE", "EXPLAIN", "FLUSH", "FORCE", "GRANT", "HANDLER", "HELP", "KILL CONNECTION", "KILLALL QUERIES", "LOAD DATA", "LOAD INDEX INTO CACHE", "LOAD XML", "LOCK INSTANCE FOR BACKUP", "LOCK TABLES", "MASTER_POS_WAIT", "OPTIMIZE TABLE", "PREPARE", "PURGE BINARY LOGS", "REBALANCE PARTITIONS", "RELEASE SAVEPOINT", "REMOVE AGGREGATOR", "REMOVE LEAF", "REPAIR TABLE", "REPLACE", "REPLICATE DATABASE", "RESET", "RESET MASTER", "RESET PERSIST", "RESET REPLICA", "RESET SLAVE", "RESTART", "RESTORE DATABASE", "RESTORE REDUNDANCY", "REVOKE", "ROLLBACK", "ROLLBACK TO SAVEPOINT", "SAVEPOINT", "SET CHARACTER SET", "SET DEFAULT ROLE", "SET NAMES", "SET PASSWORD", "SET RESOURCE GROUP", "SET ROLE", "SET TRANSACTION", "SHOW", "SHOW CHARACTER SET", "SHOW COLLATION", "SHOW COLUMNS", "SHOW CREATE DATABASE", "SHOW CREATE FUNCTION", "SHOW CREATE PIPELINE", "SHOW CREATE PROCEDURE", "SHOW CREATE TABLE", "SHOW CREATE USER", "SHOW CREATE VIEW", "SHOW DATABASES", "SHOW ENGINE", "SHOW ENGINES", "SHOW ERRORS", "SHOW FUNCTION CODE", "SHOW FUNCTION STATUS", "SHOW GRANTS", "SHOW INDEX", "SHOW MASTER STATUS", "SHOW OPEN TABLES", "SHOW PLUGINS", "SHOW PRIVILEGES", "SHOW PROCEDURE CODE", "SHOW PROCEDURE STATUS", "SHOW PROCESSLIST", "SHOW PROFILE", "SHOW PROFILES", "SHOW RELAYLOG EVENTS", "SHOW REPLICA STATUS", "SHOW REPLICAS", "SHOW SLAVE", "SHOW SLAVE HOSTS", "SHOW STATUS", "SHOW TABLE STATUS", "SHOW TABLES", "SHOW VARIABLES", "SHOW WARNINGS", "SHUTDOWN", "SNAPSHOT DATABASE", "SOURCE_POS_WAIT", "START GROUP_REPLICATION", "START PIPELINE", "START REPLICA", "START SLAVE", "START TRANSACTION", "STOP GROUP_REPLICATION", "STOP PIPELINE", "STOP REPLICA", "STOP REPLICATING", "STOP SLAVE", "TEST PIPELINE", "UNLOCK INSTANCE", "UNLOCK TABLES", "USE", "XA", "ITERATE", "LEAVE", "LOOP", "REPEAT", "RETURN", "WHILE"])
          , IR = C(["UNION [ALL | DISTINCT]", "EXCEPT", "INTERSECT", "MINUS"])
          , LR = C(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL {LEFT | RIGHT} [OUTER] JOIN", "STRAIGHT_JOIN"])
          , CR = C(["ON DELETE", "ON UPDATE", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"])
          , _R = {
            name: "singlestoredb",
            tokenizerOptions: {
                reservedSelect: AR,
                reservedClauses: [...SR, ...NR],
                reservedSetOperations: IR,
                reservedJoins: LR,
                reservedPhrases: CR,
                reservedKeywords: TR,
                reservedFunctionNames: RR,
                stringTypes: ['""-qq-bs', "''-qq-bs", {
                    quote: "''-raw",
                    prefixes: ["B", "X"],
                    requirePrefix: !0
                }],
                identTypes: ["``"],
                identChars: {
                    first: "$",
                    rest: "$",
                    allowFirstCharNumber: !0
                },
                variableTypes: [{
                    regex: "@@?[A-Za-z0-9_$]+"
                }, {
                    quote: "``",
                    prefixes: ["@"],
                    requirePrefix: !0
                }],
                lineCommentTypes: ["--", "#"],
                operators: [":=", "&", "|", "^", "~", "<<", ">>", "<=>", "&&", "||", "::", "::$", "::%", ":>", "!:>"],
                postProcess: CE
            },
            formatOptions: {
                alwaysDenseOperators: ["::", "::$", "::%"],
                onelineClauses: NR
            }
        }
          , eR = o({
            all: ["ABS", "ACOS", "ACOSH", "ADD_MONTHS", "ALL_USER_NAMES", "ANY_VALUE", "APPROX_COUNT_DISTINCT", "APPROX_PERCENTILE", "APPROX_PERCENTILE_ACCUMULATE", "APPROX_PERCENTILE_COMBINE", "APPROX_PERCENTILE_ESTIMATE", "APPROX_TOP_K", "APPROX_TOP_K_ACCUMULATE", "APPROX_TOP_K_COMBINE", "APPROX_TOP_K_ESTIMATE", "APPROXIMATE_JACCARD_INDEX", "APPROXIMATE_SIMILARITY", "ARRAY_AGG", "ARRAY_APPEND", "ARRAY_CAT", "ARRAY_COMPACT", "ARRAY_CONSTRUCT", "ARRAY_CONSTRUCT_COMPACT", "ARRAY_CONTAINS", "ARRAY_INSERT", "ARRAY_INTERSECTION", "ARRAY_POSITION", "ARRAY_PREPEND", "ARRAY_SIZE", "ARRAY_SLICE", "ARRAY_TO_STRING", "ARRAY_UNION_AGG", "ARRAY_UNIQUE_AGG", "ARRAYS_OVERLAP", "AS_ARRAY", "AS_BINARY", "AS_BOOLEAN", "AS_CHAR", "AS_VARCHAR", "AS_DATE", "AS_DECIMAL", "AS_NUMBER", "AS_DOUBLE", "AS_REAL", "AS_INTEGER", "AS_OBJECT", "AS_TIME", "AS_TIMESTAMP_LTZ", "AS_TIMESTAMP_NTZ", "AS_TIMESTAMP_TZ", "ASCII", "ASIN", "ASINH", "ATAN", "ATAN2", "ATANH", "AUTO_REFRESH_REGISTRATION_HISTORY", "AUTOMATIC_CLUSTERING_HISTORY", "AVG", "BASE64_DECODE_BINARY", "BASE64_DECODE_STRING", "BASE64_ENCODE", "BIT_LENGTH", "BITAND", "BITAND_AGG", "BITMAP_BIT_POSITION", "BITMAP_BUCKET_NUMBER", "BITMAP_CONSTRUCT_AGG", "BITMAP_COUNT", "BITMAP_OR_AGG", "BITNOT", "BITOR", "BITOR_AGG", "BITSHIFTLEFT", "BITSHIFTRIGHT", "BITXOR", "BITXOR_AGG", "BOOLAND", "BOOLAND_AGG", "BOOLNOT", "BOOLOR", "BOOLOR_AGG", "BOOLXOR", "BOOLXOR_AGG", "BUILD_SCOPED_FILE_URL", "BUILD_STAGE_FILE_URL", "CASE", "CAST", "CBRT", "CEIL", "CHARINDEX", "CHECK_JSON", "CHECK_XML", "CHR", "CHAR", "COALESCE", "COLLATE", "COLLATION", "COMPLETE_TASK_GRAPHS", "COMPRESS", "CONCAT", "CONCAT_WS", "CONDITIONAL_CHANGE_EVENT", "CONDITIONAL_TRUE_EVENT", "CONTAINS", "CONVERT_TIMEZONE", "COPY_HISTORY", "CORR", "COS", "COSH", "COT", "COUNT", "COUNT_IF", "COVAR_POP", "COVAR_SAMP", "CUME_DIST", "CURRENT_ACCOUNT", "CURRENT_AVAILABLE_ROLES", "CURRENT_CLIENT", "CURRENT_DATABASE", "CURRENT_DATE", "CURRENT_IP_ADDRESS", "CURRENT_REGION", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_SECONDARY_ROLES", "CURRENT_SESSION", "CURRENT_STATEMENT", "CURRENT_TASK_GRAPHS", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TRANSACTION", "CURRENT_USER", "CURRENT_VERSION", "CURRENT_WAREHOUSE", "DATA_TRANSFER_HISTORY", "DATABASE_REFRESH_HISTORY", "DATABASE_REFRESH_PROGRESS", "DATABASE_REFRESH_PROGRESS_BY_JOB", "DATABASE_STORAGE_USAGE_HISTORY", "DATE_FROM_PARTS", "DATE_PART", "DATE_TRUNC", "DATEADD", "DATEDIFF", "DAYNAME", "DECODE", "DECOMPRESS_BINARY", "DECOMPRESS_STRING", "DECRYPT", "DECRYPT_RAW", "DEGREES", "DENSE_RANK", "DIV0", "EDITDISTANCE", "ENCRYPT", "ENCRYPT_RAW", "ENDSWITH", "EQUAL_NULL", "EXP", "EXPLAIN_JSON", "EXTERNAL_FUNCTIONS_HISTORY", "EXTERNAL_TABLE_FILES", "EXTERNAL_TABLE_FILE_REGISTRATION_HISTORY", "EXTRACT", "EXTRACT_SEMANTIC_CATEGORIES", "FACTORIAL", "FIRST_VALUE", "FLATTEN", "FLOOR", "GENERATE_COLUMN_DESCRIPTION", "GENERATOR", "GET", "GET_ABSOLUTE_PATH", "GET_DDL", "GET_IGNORE_CASE", "GET_OBJECT_REFERENCES", "GET_PATH", "GET_PRESIGNED_URL", "GET_RELATIVE_PATH", "GET_STAGE_LOCATION", "GETBIT", "GREATEST", "GROUPING", "GROUPING_ID", "HASH", "HASH_AGG", "HAVERSINE", "HEX_DECODE_BINARY", "HEX_DECODE_STRING", "HEX_ENCODE", "HLL", "HLL_ACCUMULATE", "HLL_COMBINE", "HLL_ESTIMATE", "HLL_EXPORT", "HLL_IMPORT", "HOUR", "MINUTE", "SECOND", "IFF", "IFNULL", "ILIKE", "ILIKE ANY", "INFER_SCHEMA", "INITCAP", "INSERT", "INVOKER_ROLE", "INVOKER_SHARE", "IS_ARRAY", "IS_BINARY", "IS_BOOLEAN", "IS_CHAR", "IS_VARCHAR", "IS_DATE", "IS_DATE_VALUE", "IS_DECIMAL", "IS_DOUBLE", "IS_REAL", "IS_GRANTED_TO_INVOKER_ROLE", "IS_INTEGER", "IS_NULL_VALUE", "IS_OBJECT", "IS_ROLE_IN_SESSION", "IS_TIME", "IS_TIMESTAMP_LTZ", "IS_TIMESTAMP_NTZ", "IS_TIMESTAMP_TZ", "JAROWINKLER_SIMILARITY", "JSON_EXTRACT_PATH_TEXT", "KURTOSIS", "LAG", "LAST_DAY", "LAST_QUERY_ID", "LAST_TRANSACTION", "LAST_VALUE", "LEAD", "LEAST", "LEFT", "LENGTH", "LEN", "LIKE", "LIKE ALL", "LIKE ANY", "LISTAGG", "LN", "LOCALTIME", "LOCALTIMESTAMP", "LOG", "LOGIN_HISTORY", "LOGIN_HISTORY_BY_USER", "LOWER", "LPAD", "LTRIM", "MATERIALIZED_VIEW_REFRESH_HISTORY", "MD5", "MD5_HEX", "MD5_BINARY", "MD5_NUMBER — Obsoleted", "MD5_NUMBER_LOWER64", "MD5_NUMBER_UPPER64", "MEDIAN", "MIN", "MAX", "MINHASH", "MINHASH_COMBINE", "MOD", "MODE", "MONTHNAME", "MONTHS_BETWEEN", "NEXT_DAY", "NORMAL", "NTH_VALUE", "NTILE", "NULLIF", "NULLIFZERO", "NVL", "NVL2", "OBJECT_AGG", "OBJECT_CONSTRUCT", "OBJECT_CONSTRUCT_KEEP_NULL", "OBJECT_DELETE", "OBJECT_INSERT", "OBJECT_KEYS", "OBJECT_PICK", "OCTET_LENGTH", "PARSE_IP", "PARSE_JSON", "PARSE_URL", "PARSE_XML", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "PI", "PIPE_USAGE_HISTORY", "POLICY_CONTEXT", "POLICY_REFERENCES", "POSITION", "POW", "POWER", "PREVIOUS_DAY", "QUERY_ACCELERATION_HISTORY", "QUERY_HISTORY", "QUERY_HISTORY_BY_SESSION", "QUERY_HISTORY_BY_USER", "QUERY_HISTORY_BY_WAREHOUSE", "RADIANS", "RANDOM", "RANDSTR", "RANK", "RATIO_TO_REPORT", "REGEXP", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_LIKE", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REGEXP_SUBSTR_ALL", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "REGR_VALX", "REGR_VALY", "REPEAT", "REPLACE", "REPLICATION_GROUP_REFRESH_HISTORY", "REPLICATION_GROUP_REFRESH_PROGRESS", "REPLICATION_GROUP_REFRESH_PROGRESS_BY_JOB", "REPLICATION_GROUP_USAGE_HISTORY", "REPLICATION_USAGE_HISTORY", "REST_EVENT_HISTORY", "RESULT_SCAN", "REVERSE", "RIGHT", "RLIKE", "ROUND", "ROW_NUMBER", "RPAD", "RTRIM", "RTRIMMED_LENGTH", "SEARCH_OPTIMIZATION_HISTORY", "SEQ1", "SEQ2", "SEQ4", "SEQ8", "SERVERLESS_TASK_HISTORY", "SHA1", "SHA1_HEX", "SHA1_BINARY", "SHA2", "SHA2_HEX", "SHA2_BINARY", "SIGN", "SIN", "SINH", "SKEW", "SOUNDEX", "SPACE", "SPLIT", "SPLIT_PART", "SPLIT_TO_TABLE", "SQRT", "SQUARE", "ST_AREA", "ST_ASEWKB", "ST_ASEWKT", "ST_ASGEOJSON", "ST_ASWKB", "ST_ASBINARY", "ST_ASWKT", "ST_ASTEXT", "ST_AZIMUTH", "ST_CENTROID", "ST_COLLECT", "ST_CONTAINS", "ST_COVEREDBY", "ST_COVERS", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_DWITHIN", "ST_ENDPOINT", "ST_ENVELOPE", "ST_GEOGFROMGEOHASH", "ST_GEOGPOINTFROMGEOHASH", "ST_GEOGRAPHYFROMWKB", "ST_GEOGRAPHYFROMWKT", "ST_GEOHASH", "ST_GEOMETRYFROMWKB", "ST_GEOMETRYFROMWKT", "ST_HAUSDORFFDISTANCE", "ST_INTERSECTION", "ST_INTERSECTS", "ST_LENGTH", "ST_MAKEGEOMPOINT", "ST_GEOM_POINT", "ST_MAKELINE", "ST_MAKEPOINT", "ST_POINT", "ST_MAKEPOLYGON", "ST_POLYGON", "ST_NPOINTS", "ST_NUMPOINTS", "ST_PERIMETER", "ST_POINTN", "ST_SETSRID", "ST_SIMPLIFY", "ST_SRID", "ST_STARTPOINT", "ST_SYMDIFFERENCE", "ST_UNION", "ST_WITHIN", "ST_X", "ST_XMAX", "ST_XMIN", "ST_Y", "ST_YMAX", "ST_YMIN", "STAGE_DIRECTORY_FILE_REGISTRATION_HISTORY", "STAGE_STORAGE_USAGE_HISTORY", "STARTSWITH", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STRIP_NULL_VALUE", "STRTOK", "STRTOK_SPLIT_TO_TABLE", "STRTOK_TO_ARRAY", "SUBSTR", "SUBSTRING", "SUM", "SYSDATE", "SYSTEM$ABORT_SESSION", "SYSTEM$ABORT_TRANSACTION", "SYSTEM$AUTHORIZE_PRIVATELINK", "SYSTEM$AUTHORIZE_STAGE_PRIVATELINK_ACCESS", "SYSTEM$BEHAVIOR_CHANGE_BUNDLE_STATUS", "SYSTEM$CANCEL_ALL_QUERIES", "SYSTEM$CANCEL_QUERY", "SYSTEM$CLUSTERING_DEPTH", "SYSTEM$CLUSTERING_INFORMATION", "SYSTEM$CLUSTERING_RATIO ", "SYSTEM$CURRENT_USER_TASK_NAME", "SYSTEM$DATABASE_REFRESH_HISTORY ", "SYSTEM$DATABASE_REFRESH_PROGRESS", "SYSTEM$DATABASE_REFRESH_PROGRESS_BY_JOB ", "SYSTEM$DISABLE_BEHAVIOR_CHANGE_BUNDLE", "SYSTEM$DISABLE_DATABASE_REPLICATION", "SYSTEM$ENABLE_BEHAVIOR_CHANGE_BUNDLE", "SYSTEM$ESTIMATE_QUERY_ACCELERATION", "SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS", "SYSTEM$EXPLAIN_JSON_TO_TEXT", "SYSTEM$EXPLAIN_PLAN_JSON", "SYSTEM$EXTERNAL_TABLE_PIPE_STATUS", "SYSTEM$GENERATE_SAML_CSR", "SYSTEM$GENERATE_SCIM_ACCESS_TOKEN", "SYSTEM$GET_AWS_SNS_IAM_POLICY", "SYSTEM$GET_PREDECESSOR_RETURN_VALUE", "SYSTEM$GET_PRIVATELINK", "SYSTEM$GET_PRIVATELINK_AUTHORIZED_ENDPOINTS", "SYSTEM$GET_PRIVATELINK_CONFIG", "SYSTEM$GET_SNOWFLAKE_PLATFORM_INFO", "SYSTEM$GET_TAG", "SYSTEM$GET_TAG_ALLOWED_VALUES", "SYSTEM$GET_TAG_ON_CURRENT_COLUMN", "SYSTEM$GET_TAG_ON_CURRENT_TABLE", "SYSTEM$GLOBAL_ACCOUNT_SET_PARAMETER", "SYSTEM$LAST_CHANGE_COMMIT_TIME", "SYSTEM$LINK_ACCOUNT_OBJECTS_BY_NAME", "SYSTEM$MIGRATE_SAML_IDP_REGISTRATION", "SYSTEM$PIPE_FORCE_RESUME", "SYSTEM$PIPE_STATUS", "SYSTEM$REVOKE_PRIVATELINK", "SYSTEM$REVOKE_STAGE_PRIVATELINK_ACCESS", "SYSTEM$SET_RETURN_VALUE", "SYSTEM$SHOW_OAUTH_CLIENT_SECRETS", "SYSTEM$STREAM_GET_TABLE_TIMESTAMP", "SYSTEM$STREAM_HAS_DATA", "SYSTEM$TASK_DEPENDENTS_ENABLE", "SYSTEM$TYPEOF", "SYSTEM$USER_TASK_CANCEL_ONGOING_EXECUTIONS", "SYSTEM$VERIFY_EXTERNAL_OAUTH_TOKEN", "SYSTEM$WAIT", "SYSTEM$WHITELIST", "SYSTEM$WHITELIST_PRIVATELINK", "TAG_REFERENCES", "TAG_REFERENCES_ALL_COLUMNS", "TAG_REFERENCES_WITH_LINEAGE", "TAN", "TANH", "TASK_DEPENDENTS", "TASK_HISTORY", "TIME_FROM_PARTS", "TIME_SLICE", "TIMEADD", "TIMEDIFF", "TIMESTAMP_FROM_PARTS", "TIMESTAMPADD", "TIMESTAMPDIFF", "TO_ARRAY", "TO_BINARY", "TO_BOOLEAN", "TO_CHAR", "TO_VARCHAR", "TO_DATE", "DATE", "TO_DECIMAL", "TO_NUMBER", "TO_NUMERIC", "TO_DOUBLE", "TO_GEOGRAPHY", "TO_GEOMETRY", "TO_JSON", "TO_OBJECT", "TO_TIME", "TIME", "TO_TIMESTAMP", "TO_TIMESTAMP_LTZ", "TO_TIMESTAMP_NTZ", "TO_TIMESTAMP_TZ", "TO_VARIANT", "TO_XML", "TRANSLATE", "TRIM", "TRUNCATE", "TRUNC", "TRUNC", "TRY_BASE64_DECODE_BINARY", "TRY_BASE64_DECODE_STRING", "TRY_CAST", "TRY_HEX_DECODE_BINARY", "TRY_HEX_DECODE_STRING", "TRY_PARSE_JSON", "TRY_TO_BINARY", "TRY_TO_BOOLEAN", "TRY_TO_DATE", "TRY_TO_DECIMAL", "TRY_TO_NUMBER", "TRY_TO_NUMERIC", "TRY_TO_DOUBLE", "TRY_TO_GEOGRAPHY", "TRY_TO_GEOMETRY", "TRY_TO_TIME", "TRY_TO_TIMESTAMP", "TRY_TO_TIMESTAMP_LTZ", "TRY_TO_TIMESTAMP_NTZ", "TRY_TO_TIMESTAMP_TZ", "TYPEOF", "UNICODE", "UNIFORM", "UPPER", "UUID_STRING", "VALIDATE", "VALIDATE_PIPE_LOAD", "VAR_POP", "VAR_SAMP", "VARIANCE", "VARIANCE_SAMP", "VARIANCE_POP", "WAREHOUSE_LOAD_HISTORY", "WAREHOUSE_METERING_HISTORY", "WIDTH_BUCKET", "XMLGET", "YEAR", "YEAROFWEEK", "YEAROFWEEKISO", "DAY", "DAYOFMONTH", "DAYOFWEEK", "DAYOFWEEKISO", "DAYOFYEAR", "WEEK", "WEEK", "WEEKOFYEAR", "WEEKISO", "MONTH", "QUARTER", "ZEROIFNULL", "ZIPF"]
        })
          , PR = o({
            all: ["ACCOUNT", "ALL", "ALTER", "AND", "ANY", "AS", "BETWEEN", "BY", "CASE", "CAST", "CHECK", "COLUMN", "CONNECT", "CONNECTION", "CONSTRAINT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DATABASE", "DELETE", "DISTINCT", "DROP", "ELSE", "EXISTS", "FALSE", "FOLLOWING", "FOR", "FROM", "FULL", "GRANT", "GROUP", "GSCLUSTER", "HAVING", "ILIKE", "IN", "INCREMENT", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "ISSUE", "JOIN", "LATERAL", "LEFT", "LIKE", "LOCALTIME", "LOCALTIMESTAMP", "MINUS", "NATURAL", "NOT", "NULL", "OF", "ON", "OR", "ORDER", "ORGANIZATION", "QUALIFY", "REGEXP", "REVOKE", "RIGHT", "RLIKE", "ROW", "ROWS", "SAMPLE", "SCHEMA", "SELECT", "SET", "SOME", "START", "TABLE", "TABLESAMPLE", "THEN", "TO", "TRIGGER", "TRUE", "TRY_CAST", "UNION", "UNIQUE", "UPDATE", "USING", "VALUES", "VIEW", "WHEN", "WHENEVER", "WHERE", "WITH"],
            additional: ["COMMENT"],
            datatypes: ["NUMBER", "DECIMAL", "NUMERIC", "INT", "INTEGER", "BIGINT", "SMALLINT", "TINYINT", "BYTEINT", "FLOAT", "FLOAT4", "FLOAT8", "DOUBLE", "DOUBLE PRECISION", "REAL", "VARCHAR", "CHAR", "CHARACTER", "STRING", "TEXT", "BINARY", "VARBINARY", "BOOLEAN", "DATE", "DATETIME", "TIME", "TIMESTAMP", "TIMESTAMP_LTZ", "TIMESTAMP_NTZ", "TIMESTAMP", "TIMESTAMP_TZ", "VARIANT", "OBJECT", "ARRAY", "GEOGRAPHY", "GEOMETRY"]
        })
          , DR = C(["SELECT [ALL | DISTINCT]"])
          , sR = C(["WITH [RECURSIVE]", "FROM", "WHERE", "GROUP BY", "HAVING", "PARTITION BY", "ORDER BY", "QUALIFY", "LIMIT", "OFFSET", "FETCH [FIRST | NEXT]", "INSERT [OVERWRITE] [ALL INTO | INTO | ALL | FIRST]", "{THEN | ELSE} INTO", "VALUES", "SET", "CREATE [OR REPLACE] [SECURE] [RECURSIVE] VIEW [IF NOT EXISTS]", "CREATE [OR REPLACE] [VOLATILE] TABLE [IF NOT EXISTS]", "CREATE [OR REPLACE] [LOCAL | GLOBAL] {TEMP|TEMPORARY} TABLE [IF NOT EXISTS]", "CLUSTER BY", "[WITH] {MASKING POLICY | TAG | ROW ACCESS POLICY}", "COPY GRANTS", "USING TEMPLATE", "MERGE INTO", "WHEN MATCHED [AND]", "THEN {UPDATE SET | DELETE}", "WHEN NOT MATCHED THEN INSERT"])
          , MR = C(["UPDATE", "DELETE FROM", "DROP TABLE [IF EXISTS]", "ALTER TABLE [IF EXISTS]", "RENAME TO", "SWAP WITH", "[SUSPEND | RESUME] RECLUSTER", "DROP CLUSTERING KEY", "ADD [COLUMN]", "RENAME COLUMN", "{ALTER | MODIFY} [COLUMN]", "DROP [COLUMN]", "{ADD | ALTER | MODIFY | DROP} [CONSTRAINT]", "RENAME CONSTRAINT", "{ADD | DROP} SEARCH OPTIMIZATION", "{SET | UNSET} TAG", "{ADD | DROP} ROW ACCESS POLICY", "DROP ALL ROW ACCESS POLICIES", "{SET | DROP} DEFAULT", "{SET | DROP} NOT NULL", "[SET DATA] TYPE", "UNSET COMMENT", "{SET | UNSET} MASKING POLICY", "TRUNCATE [TABLE] [IF EXISTS]", "ALTER ACCOUNT", "ALTER API INTEGRATION", "ALTER CONNECTION", "ALTER DATABASE", "ALTER EXTERNAL TABLE", "ALTER FAILOVER GROUP", "ALTER FILE FORMAT", "ALTER FUNCTION", "ALTER INTEGRATION", "ALTER MASKING POLICY", "ALTER MATERIALIZED VIEW", "ALTER NETWORK POLICY", "ALTER NOTIFICATION INTEGRATION", "ALTER PIPE", "ALTER PROCEDURE", "ALTER REPLICATION GROUP", "ALTER RESOURCE MONITOR", "ALTER ROLE", "ALTER ROW ACCESS POLICY", "ALTER SCHEMA", "ALTER SECURITY INTEGRATION", "ALTER SEQUENCE", "ALTER SESSION", "ALTER SESSION POLICY", "ALTER SHARE", "ALTER STAGE", "ALTER STORAGE INTEGRATION", "ALTER STREAM", "ALTER TAG", "ALTER TASK", "ALTER USER", "ALTER VIEW", "ALTER WAREHOUSE", "BEGIN", "CALL", "COMMIT", "COPY INTO", "CREATE ACCOUNT", "CREATE API INTEGRATION", "CREATE CONNECTION", "CREATE DATABASE", "CREATE EXTERNAL FUNCTION", "CREATE EXTERNAL TABLE", "CREATE FAILOVER GROUP", "CREATE FILE FORMAT", "CREATE FUNCTION", "CREATE INTEGRATION", "CREATE MANAGED ACCOUNT", "CREATE MASKING POLICY", "CREATE MATERIALIZED VIEW", "CREATE NETWORK POLICY", "CREATE NOTIFICATION INTEGRATION", "CREATE PIPE", "CREATE PROCEDURE", "CREATE REPLICATION GROUP", "CREATE RESOURCE MONITOR", "CREATE ROLE", "CREATE ROW ACCESS POLICY", "CREATE SCHEMA", "CREATE SECURITY INTEGRATION", "CREATE SEQUENCE", "CREATE SESSION POLICY", "CREATE SHARE", "CREATE STAGE", "CREATE STORAGE INTEGRATION", "CREATE STREAM", "CREATE TAG", "CREATE TASK", "CREATE USER", "CREATE WAREHOUSE", "DELETE", "DESCRIBE DATABASE", "DESCRIBE EXTERNAL TABLE", "DESCRIBE FILE FORMAT", "DESCRIBE FUNCTION", "DESCRIBE INTEGRATION", "DESCRIBE MASKING POLICY", "DESCRIBE MATERIALIZED VIEW", "DESCRIBE NETWORK POLICY", "DESCRIBE PIPE", "DESCRIBE PROCEDURE", "DESCRIBE RESULT", "DESCRIBE ROW ACCESS POLICY", "DESCRIBE SCHEMA", "DESCRIBE SEQUENCE", "DESCRIBE SESSION POLICY", "DESCRIBE SHARE", "DESCRIBE STAGE", "DESCRIBE STREAM", "DESCRIBE TABLE", "DESCRIBE TASK", "DESCRIBE TRANSACTION", "DESCRIBE USER", "DESCRIBE VIEW", "DESCRIBE WAREHOUSE", "DROP CONNECTION", "DROP DATABASE", "DROP EXTERNAL TABLE", "DROP FAILOVER GROUP", "DROP FILE FORMAT", "DROP FUNCTION", "DROP INTEGRATION", "DROP MANAGED ACCOUNT", "DROP MASKING POLICY", "DROP MATERIALIZED VIEW", "DROP NETWORK POLICY", "DROP PIPE", "DROP PROCEDURE", "DROP REPLICATION GROUP", "DROP RESOURCE MONITOR", "DROP ROLE", "DROP ROW ACCESS POLICY", "DROP SCHEMA", "DROP SEQUENCE", "DROP SESSION POLICY", "DROP SHARE", "DROP STAGE", "DROP STREAM", "DROP TAG", "DROP TASK", "DROP USER", "DROP VIEW", "DROP WAREHOUSE", "EXECUTE IMMEDIATE", "EXECUTE TASK", "EXPLAIN", "GET", "GRANT OWNERSHIP", "GRANT ROLE", "INSERT", "LIST", "MERGE", "PUT", "REMOVE", "REVOKE ROLE", "ROLLBACK", "SHOW COLUMNS", "SHOW CONNECTIONS", "SHOW DATABASES", "SHOW DATABASES IN FAILOVER GROUP", "SHOW DATABASES IN REPLICATION GROUP", "SHOW DELEGATED AUTHORIZATIONS", "SHOW EXTERNAL FUNCTIONS", "SHOW EXTERNAL TABLES", "SHOW FAILOVER GROUPS", "SHOW FILE FORMATS", "SHOW FUNCTIONS", "SHOW GLOBAL ACCOUNTS", "SHOW GRANTS", "SHOW INTEGRATIONS", "SHOW LOCKS", "SHOW MANAGED ACCOUNTS", "SHOW MASKING POLICIES", "SHOW MATERIALIZED VIEWS", "SHOW NETWORK POLICIES", "SHOW OBJECTS", "SHOW ORGANIZATION ACCOUNTS", "SHOW PARAMETERS", "SHOW PIPES", "SHOW PRIMARY KEYS", "SHOW PROCEDURES", "SHOW REGIONS", "SHOW REPLICATION ACCOUNTS", "SHOW REPLICATION DATABASES", "SHOW REPLICATION GROUPS", "SHOW RESOURCE MONITORS", "SHOW ROLES", "SHOW ROW ACCESS POLICIES", "SHOW SCHEMAS", "SHOW SEQUENCES", "SHOW SESSION POLICIES", "SHOW SHARES", "SHOW SHARES IN FAILOVER GROUP", "SHOW SHARES IN REPLICATION GROUP", "SHOW STAGES", "SHOW STREAMS", "SHOW TABLES", "SHOW TAGS", "SHOW TASKS", "SHOW TRANSACTIONS", "SHOW USER FUNCTIONS", "SHOW USERS", "SHOW VARIABLES", "SHOW VIEWS", "SHOW WAREHOUSES", "TRUNCATE MATERIALIZED VIEW", "UNDROP DATABASE", "UNDROP SCHEMA", "UNDROP TABLE", "UNDROP TAG", "UNSET", "USE DATABASE", "USE ROLE", "USE SCHEMA", "USE SECONDARY ROLES", "USE WAREHOUSE"])
          , UR = C(["UNION [ALL]", "MINUS", "EXCEPT", "INTERSECT"])
          , tR = C(["[INNER] JOIN", "[NATURAL] {LEFT | RIGHT | FULL} [OUTER] JOIN", "{CROSS | NATURAL} JOIN"])
          , rR = C(["{ROWS | RANGE} BETWEEN", "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]"])
          , GR = {
            name: "snowflake",
            tokenizerOptions: {
                reservedSelect: DR,
                reservedClauses: [...sR, ...MR],
                reservedSetOperations: UR,
                reservedJoins: tR,
                reservedPhrases: rR,
                reservedKeywords: PR,
                reservedFunctionNames: eR,
                stringTypes: ["$$", "''-qq-bs"],
                identTypes: ['""-qq'],
                variableTypes: [{
                    regex: "[$][1-9]\\d*"
                }, {
                    regex: "[$][_a-zA-Z][_a-zA-Z0-9$]*"
                }],
                extraParens: ["[]"],
                identChars: {
                    rest: "$"
                },
                lineCommentTypes: ["--", "//"],
                operators: ["%", "::", "||", ":", "=>"]
            },
            formatOptions: {
                alwaysDenseOperators: [":", "::"],
                onelineClauses: MR
            }
        }
          , nR = E=>E.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
          , iR = /\s+/uy
          , aR = E=>new RegExp(`(?:${E})`,"uy")
          , oR = E=>E.split("").map((E=>/ /gu.test(E) ? "\\s+" : `[${E.toUpperCase()}${E.toLowerCase()}]`)).join("")
          , HR = (E,T=[])=>{
            const R = "open" === E ? 0 : 1
              , A = ["()", ...T].map((E=>E[R]));
            return aR(A.map(nR).join("|"))
        }
          , BR = (E,T={})=>{
            if (0 === E.length)
                return /^\b$/u;
            const R = (({rest: E, dashes: T})=>E || T ? `(?![${E || ""}${T ? "-" : ""}])` : "")(T)
              , A = i(E).map(nR).join("|").replace(/ /gu, "\\s+");
            return new RegExp(`(?:${A})${R}\\b`,"iuy")
        }
          , FR = (E,T)=>{
            if (!E.length)
                return;
            const R = E.map(nR).join("|");
            return aR(`(?:${R})(?:${T})`)
        }
          , YR = {
            "``": "(?:`[^`]*`)+",
            "[]": String.raw`(?:\[[^\]]*\])(?:\][^\]]*\])*`,
            '""-qq': String.raw`(?:"[^"]*")+`,
            '""-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")`,
            '""-qq-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")+`,
            '""-raw': String.raw`(?:"[^"]*")`,
            "''-qq": String.raw`(?:'[^']*')+`,
            "''-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')`,
            "''-qq-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')+`,
            "''-raw": String.raw`(?:'[^']*')`,
            $$: String.raw`(?<tag>\$\w*\$)[\s\S]*?\k<tag>`,
            "'''..'''": String.raw`'''[^\\]*?(?:\\.[^\\]*?)*?'''`,
            '""".."""': String.raw`"""[^\\]*?(?:\\.[^\\]*?)*?"""`,
            "{}": String.raw`(?:\{[^\}]*\})`,
            "q''": (()=>{
                const E = {
                    "<": ">",
                    "[": "]",
                    "(": ")",
                    "{": "}"
                }
                  , T = Object.entries(E).map((([E,T])=>"{left}(?:(?!{right}').)*?{right}".replace(/{left}/g, nR(E)).replace(/{right}/g, nR(T))))
                  , R = nR(Object.keys(E).join(""));
                return `[Qq]'(?:${String.raw`(?<tag>[^\s ${R}])(?:(?!\k<tag>').)*?\k<tag>`}|${T.join("|")})'`
            }
            )()
        }
          , lR = E=>"string" == typeof E ? YR[E] : "regex"in E ? E.regex : (({prefixes: E, requirePrefix: T})=>`(?:${E.map(oR).join("|")}${T ? "" : "|"})`)(E) + YR[E.quote]
          , VR = E=>E.map(lR).join("|")
          , pR = E=>aR(VR(E))
          , WR = (E={})=>aR(XR(E))
          , XR = ({first: E, rest: T, dashes: R, allowFirstCharNumber: A}={})=>{
            const S = "\\p{Alphabetic}\\p{Mark}_"
              , N = "\\p{Decimal_Number}"
              , O = nR(null != E ? E : "")
              , I = nR(null != T ? T : "")
              , L = A ? `[${S}${N}${O}][${S}${N}${I}]*` : `[${S}${O}][${S}${N}${I}]*`;
            return R ? (E=>E + "(?:-" + E + ")*")(L) : L
        }
        ;
        function cR(E, T) {
            const R = E.slice(0, T).split(/\n/);
            return {
                line: R.length,
                col: R[R.length - 1].length + 1
            }
        }
        class mR {
            constructor(E, T) {
                this.rules = E,
                this.dialectName = T,
                this.input = "",
                this.index = 0
            }
            tokenize(E) {
                this.input = E,
                this.index = 0;
                const T = [];
                let R;
                for (; this.index < this.input.length; ) {
                    const E = this.getWhitespace();
                    if (this.index < this.input.length) {
                        if (R = this.getNextToken(),
                        !R)
                            throw this.createParseError();
                        T.push(Object.assign(Object.assign({}, R), {
                            precedingWhitespace: E
                        }))
                    }
                }
                return T
            }
            createParseError() {
                const E = this.input.slice(this.index, this.index + 10)
                  , {line: T, col: R} = cR(this.input, this.index);
                return new Error(`Parse error: Unexpected "${E}" at line ${T} column ${R}.\n ${this.dialectInfo()}`)
            }
            dialectInfo() {
                return "sql" === this.dialectName ? 'This likely happens because you\'re using the default "sql" dialect.\nIf possible, please select a more specific dialect (like sqlite, postgresql, etc).' : `SQL dialect used: "${this.dialectName}".`
            }
            getWhitespace() {
                iR.lastIndex = this.index;
                const E = iR.exec(this.input);
                if (E)
                    return this.index += E[0].length,
                    E[0]
            }
            getNextToken() {
                for (const E of this.rules) {
                    const T = this.match(E);
                    if (T)
                        return T
                }
            }
            match(E) {
                E.regex.lastIndex = this.index;
                const T = E.regex.exec(this.input);
                if (T) {
                    const R = T[0]
                      , A = {
                        type: E.type,
                        raw: R,
                        text: E.text ? E.text(R) : R,
                        start: this.index
                    };
                    return E.key && (A.key = E.key(R)),
                    this.index += R.length,
                    A
                }
            }
        }
        const uR = /\/\*/uy
          , hR = /([^/*]|\*[^/]|\/[^*])+/uy
          , dR = /\*\//uy;
        class KR {
            constructor() {
                this.lastIndex = 0
            }
            exec(E) {
                let T, R = "", A = 0;
                if (!(T = this.matchSection(uR, E)))
                    return null;
                for (R += T,
                A++; A > 0; )
                    if (T = this.matchSection(uR, E))
                        R += T,
                        A++;
                    else if (T = this.matchSection(dR, E))
                        R += T,
                        A--;
                    else {
                        if (!(T = this.matchSection(hR, E)))
                            return null;
                        R += T
                    }
                return [R]
            }
            matchSection(E, T) {
                E.lastIndex = this.lastIndex;
                const R = E.exec(T);
                return R && (this.lastIndex += R[0].length),
                R ? R[0] : null
            }
        }
        class yR {
            constructor(E, T) {
                this.cfg = E,
                this.dialectName = T,
                this.rulesBeforeParams = this.buildRulesBeforeParams(E),
                this.rulesAfterParams = this.buildRulesAfterParams(E)
            }
            tokenize(E, T) {
                const R = [...this.rulesBeforeParams, ...this.buildParamRules(this.cfg, T), ...this.rulesAfterParams]
                  , A = new mR(R,this.dialectName).tokenize(E);
                return this.cfg.postProcess ? this.cfg.postProcess(A) : A
            }
            buildRulesBeforeParams(T) {
                var R, A, S;
                return this.validRules([{
                    type: E.BLOCK_COMMENT,
                    regex: T.nestedBlockComments ? new KR : /(\/\*[^]*?\*\/)/uy
                }, {
                    type: E.LINE_COMMENT,
                    regex: (S = null !== (R = T.lineCommentTypes) && void 0 !== R ? R : ["--"],
                    new RegExp(`(?:${S.map(nR).join("|")}).*?(?=\r\n|\r|\n|$)`,"uy"))
                }, {
                    type: E.QUOTED_IDENTIFIER,
                    regex: pR(T.identTypes)
                }, {
                    type: E.NUMBER,
                    regex: /(?:0x[0-9a-fA-F]+|0b[01]+|(?:-\s*)?[0-9]+(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+(?:\.[0-9]+)?)?)(?![\w\p{Alphabetic}])/uy
                }, {
                    type: E.RESERVED_PHRASE,
                    regex: BR(null !== (A = T.reservedPhrases) && void 0 !== A ? A : [], T.identChars),
                    text: fR
                }, {
                    type: E.CASE,
                    regex: /CASE\b/iuy,
                    text: fR
                }, {
                    type: E.END,
                    regex: /END\b/iuy,
                    text: fR
                }, {
                    type: E.BETWEEN,
                    regex: /BETWEEN\b/iuy,
                    text: fR
                }, {
                    type: E.LIMIT,
                    regex: T.reservedClauses.includes("LIMIT") ? /LIMIT\b/iuy : void 0,
                    text: fR
                }, {
                    type: E.RESERVED_CLAUSE,
                    regex: BR(T.reservedClauses, T.identChars),
                    text: fR
                }, {
                    type: E.RESERVED_SELECT,
                    regex: BR(T.reservedSelect, T.identChars),
                    text: fR
                }, {
                    type: E.RESERVED_SET_OPERATION,
                    regex: BR(T.reservedSetOperations, T.identChars),
                    text: fR
                }, {
                    type: E.WHEN,
                    regex: /WHEN\b/iuy,
                    text: fR
                }, {
                    type: E.ELSE,
                    regex: /ELSE\b/iuy,
                    text: fR
                }, {
                    type: E.THEN,
                    regex: /THEN\b/iuy,
                    text: fR
                }, {
                    type: E.RESERVED_JOIN,
                    regex: BR(T.reservedJoins, T.identChars),
                    text: fR
                }, {
                    type: E.AND,
                    regex: /AND\b/iuy,
                    text: fR
                }, {
                    type: E.OR,
                    regex: /OR\b/iuy,
                    text: fR
                }, {
                    type: E.XOR,
                    regex: T.supportsXor ? /XOR\b/iuy : void 0,
                    text: fR
                }, {
                    type: E.RESERVED_FUNCTION_NAME,
                    regex: BR(T.reservedFunctionNames, T.identChars),
                    text: fR
                }, {
                    type: E.RESERVED_KEYWORD,
                    regex: BR(T.reservedKeywords, T.identChars),
                    text: fR
                }])
            }
            buildRulesAfterParams(T) {
                var R, A, S;
                return this.validRules([{
                    type: E.VARIABLE,
                    regex: T.variableTypes ? (S = T.variableTypes,
                    aR(S.map((E=>"regex"in E ? E.regex : lR(E))).join("|"))) : void 0
                }, {
                    type: E.STRING,
                    regex: pR(T.stringTypes)
                }, {
                    type: E.IDENTIFIER,
                    regex: WR(T.identChars)
                }, {
                    type: E.DELIMITER,
                    regex: /[;]/uy
                }, {
                    type: E.COMMA,
                    regex: /[,]/y
                }, {
                    type: E.OPEN_PAREN,
                    regex: HR("open", T.extraParens)
                }, {
                    type: E.CLOSE_PAREN,
                    regex: HR("close", T.extraParens)
                }, {
                    type: E.OPERATOR,
                    regex: (A = ["+", "-", "/", ">", "<", "=", "<>", "<=", ">=", "!=", ...null !== (R = T.operators) && void 0 !== R ? R : []],
                    aR(`${i(A).map(nR).join("|")}`))
                }, {
                    type: E.ASTERISK,
                    regex: /[*]/uy
                }, {
                    type: E.DOT,
                    regex: /[.]/uy
                }])
            }
            buildParamRules(T, R) {
                var A, S, N, O, I;
                const L = {
                    named: (null == R ? void 0 : R.named) || (null === (A = T.paramTypes) || void 0 === A ? void 0 : A.named) || [],
                    quoted: (null == R ? void 0 : R.quoted) || (null === (S = T.paramTypes) || void 0 === S ? void 0 : S.quoted) || [],
                    numbered: (null == R ? void 0 : R.numbered) || (null === (N = T.paramTypes) || void 0 === N ? void 0 : N.numbered) || [],
                    positional: "boolean" == typeof (null == R ? void 0 : R.positional) ? R.positional : null === (O = T.paramTypes) || void 0 === O ? void 0 : O.positional,
                    custom: (null == R ? void 0 : R.custom) || (null === (I = T.paramTypes) || void 0 === I ? void 0 : I.custom) || []
                };
                return this.validRules([{
                    type: E.NAMED_PARAMETER,
                    regex: FR(L.named, XR(T.paramChars || T.identChars)),
                    key: E=>E.slice(1)
                }, {
                    type: E.QUOTED_PARAMETER,
                    regex: FR(L.quoted, VR(T.identTypes)),
                    key: E=>(({tokenKey: E, quoteChar: T})=>E.replace(new RegExp(nR("\\" + T),"gu"), T))({
                        tokenKey: E.slice(2, -1),
                        quoteChar: E.slice(-1)
                    })
                }, {
                    type: E.NUMBERED_PARAMETER,
                    regex: FR(L.numbered, "[0-9]+"),
                    key: E=>E.slice(1)
                }, {
                    type: E.POSITIONAL_PARAMETER,
                    regex: L.positional ? /[?]/y : void 0
                }, ...L.custom.map((T=>{
                    var R;
                    return {
                        type: E.CUSTOM_PARAMETER,
                        regex: aR(T.regex),
                        key: null !== (R = T.key) && void 0 !== R ? R : E=>E
                    }
                }
                ))])
            }
            validRules(E) {
                return E.filter((E=>Boolean(E.regex)))
            }
        }
        const fR = E=>a(E.toUpperCase())
          , bR = new Map
          , xR = E=>({
            alwaysDenseOperators: E.alwaysDenseOperators || [],
            onelineClauses: Object.fromEntries(E.onelineClauses.map((E=>[E, !0])))
        });
        function JR(E) {
            return "tabularLeft" === E.indentStyle || "tabularRight" === E.indentStyle
        }
        class gR {
            constructor(E) {
                this.params = E,
                this.index = 0
            }
            get({key: E, text: T}) {
                return this.params ? E ? this.params[E] : this.params[this.index++] : T
            }
            getPositionalParameterIndex() {
                return this.index
            }
            setPositionalParameterIndex(E) {
                this.index = E
            }
        }
        var $R = R(654)
          , wR = R.n($R);
        const vR = (T,R,A)=>{
            if (L(T.type)) {
                const S = kR(A, R);
                if (S && "." === S.text)
                    return Object.assign(Object.assign({}, T), {
                        type: E.IDENTIFIER,
                        text: T.raw
                    })
            }
            return T
        }
          , QR = (T,R,A)=>{
            if (T.type === E.RESERVED_FUNCTION_NAME) {
                const S = jR(A, R);
                if (!S || !zR(S))
                    return Object.assign(Object.assign({}, T), {
                        type: E.RESERVED_KEYWORD
                    })
            }
            return T
        }
          , ZR = (T,R,A)=>{
            if (T.type === E.IDENTIFIER) {
                const S = jR(A, R);
                if (S && EA(S))
                    return Object.assign(Object.assign({}, T), {
                        type: E.ARRAY_IDENTIFIER
                    })
            }
            return T
        }
          , qR = (T,R,A)=>{
            if (T.type === E.RESERVED_KEYWORD) {
                const S = jR(A, R);
                if (S && EA(S))
                    return Object.assign(Object.assign({}, T), {
                        type: E.ARRAY_KEYWORD
                    })
            }
            return T
        }
          , kR = (E,T)=>jR(E, T, -1)
          , jR = (E,T,R=1)=>{
            let A = 1;
            for (; E[T + A * R] && TA(E[T + A * R]); )
                A++;
            return E[T + A * R]
        }
          , zR = T=>T.type === E.OPEN_PAREN && "(" === T.text
          , EA = T=>T.type === E.OPEN_PAREN && "[" === T.text
          , TA = T=>T.type === E.BLOCK_COMMENT || T.type === E.LINE_COMMENT;
        class RA {
            constructor(E) {
                this.tokenize = E,
                this.index = 0,
                this.tokens = [],
                this.input = ""
            }
            reset(E, T) {
                this.input = E,
                this.index = 0,
                this.tokens = this.tokenize(E)
            }
            next() {
                return this.tokens[this.index++]
            }
            save() {}
            formatError(E) {
                const {line: T, col: R} = cR(this.input, E.start);
                return `Parse error at token: ${E.text} at line ${T} column ${R}`
            }
            has(T) {
                return T in E
            }
        }
        var AA;
        function SA(E) {
            return E[0]
        }
        !function(E) {
            E.statement = "statement",
            E.clause = "clause",
            E.set_operation = "set_operation",
            E.function_call = "function_call",
            E.array_subscript = "array_subscript",
            E.property_access = "property_access",
            E.parenthesis = "parenthesis",
            E.between_predicate = "between_predicate",
            E.case_expression = "case_expression",
            E.case_when = "case_when",
            E.case_else = "case_else",
            E.limit_clause = "limit_clause",
            E.all_columns_asterisk = "all_columns_asterisk",
            E.literal = "literal",
            E.identifier = "identifier",
            E.keyword = "keyword",
            E.parameter = "parameter",
            E.operator = "operator",
            E.comma = "comma",
            E.line_comment = "line_comment",
            E.block_comment = "block_comment"
        }(AA = AA || (AA = {}));
        const NA = new RA((E=>[]))
          , OA = ([[E]])=>E
          , IA = E=>({
            type: AA.keyword,
            tokenType: E.type,
            text: E.text,
            raw: E.raw
        })
          , LA = (E,{leading: T, trailing: R})=>((null == T ? void 0 : T.length) && (E = Object.assign(Object.assign({}, E), {
            leadingComments: T
        })),
        (null == R ? void 0 : R.length) && (E = Object.assign(Object.assign({}, E), {
            trailingComments: R
        })),
        E)
          , CA = (E,{leading: T, trailing: R})=>{
            if (null == T ? void 0 : T.length) {
                const [R,...A] = E;
                E = [LA(R, {
                    leading: T
                }), ...A]
            }
            if (null == R ? void 0 : R.length) {
                const T = E.slice(0, -1)
                  , A = E[E.length - 1];
                E = [...T, LA(A, {
                    trailing: R
                })]
            }
            return E
        }
          , _A = {
            Lexer: NA,
            ParserRules: [{
                name: "main$ebnf$1",
                symbols: []
            }, {
                name: "main$ebnf$1",
                symbols: ["main$ebnf$1", "statement"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "main",
                symbols: ["main$ebnf$1"],
                postprocess: ([E])=>{
                    const T = E[E.length - 1];
                    return T && !T.hasSemicolon ? T.children.length > 0 ? E : E.slice(0, -1) : E
                }
            }, {
                name: "statement$subexpression$1",
                symbols: [NA.has("DELIMITER") ? {
                    type: "DELIMITER"
                } : DELIMITER]
            }, {
                name: "statement$subexpression$1",
                symbols: [NA.has("EOF") ? {
                    type: "EOF"
                } : EOF]
            }, {
                name: "statement",
                symbols: ["expressions_or_clauses", "statement$subexpression$1"],
                postprocess: ([T,[R]])=>({
                    type: AA.statement,
                    children: T,
                    hasSemicolon: R.type === E.DELIMITER
                })
            }, {
                name: "expressions_or_clauses$ebnf$1",
                symbols: []
            }, {
                name: "expressions_or_clauses$ebnf$1",
                symbols: ["expressions_or_clauses$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "expressions_or_clauses$ebnf$2",
                symbols: []
            }, {
                name: "expressions_or_clauses$ebnf$2",
                symbols: ["expressions_or_clauses$ebnf$2", "clause"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "expressions_or_clauses",
                symbols: ["expressions_or_clauses$ebnf$1", "expressions_or_clauses$ebnf$2"],
                postprocess: ([E,T])=>[...E, ...T]
            }, {
                name: "clause$subexpression$1",
                symbols: ["limit_clause"]
            }, {
                name: "clause$subexpression$1",
                symbols: ["select_clause"]
            }, {
                name: "clause$subexpression$1",
                symbols: ["other_clause"]
            }, {
                name: "clause$subexpression$1",
                symbols: ["set_operation"]
            }, {
                name: "clause",
                symbols: ["clause$subexpression$1"],
                postprocess: OA
            }, {
                name: "limit_clause$ebnf$1$subexpression$1$ebnf$1",
                symbols: ["free_form_sql"]
            }, {
                name: "limit_clause$ebnf$1$subexpression$1$ebnf$1",
                symbols: ["limit_clause$ebnf$1$subexpression$1$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "limit_clause$ebnf$1$subexpression$1",
                symbols: [NA.has("COMMA") ? {
                    type: "COMMA"
                } : COMMA, "limit_clause$ebnf$1$subexpression$1$ebnf$1"]
            }, {
                name: "limit_clause$ebnf$1",
                symbols: ["limit_clause$ebnf$1$subexpression$1"],
                postprocess: SA
            }, {
                name: "limit_clause$ebnf$1",
                symbols: [],
                postprocess: ()=>null
            }, {
                name: "limit_clause",
                symbols: [NA.has("LIMIT") ? {
                    type: "LIMIT"
                } : LIMIT, "_", "expression_chain_", "limit_clause$ebnf$1"],
                postprocess: ([E,T,R,A])=>{
                    if (A) {
                        const [S,N] = A;
                        return {
                            type: AA.limit_clause,
                            limitKw: LA(IA(E), {
                                trailing: T
                            }),
                            offset: R,
                            count: N
                        }
                    }
                    return {
                        type: AA.limit_clause,
                        limitKw: LA(IA(E), {
                            trailing: T
                        }),
                        count: R
                    }
                }
            }, {
                name: "select_clause$subexpression$1$ebnf$1",
                symbols: []
            }, {
                name: "select_clause$subexpression$1$ebnf$1",
                symbols: ["select_clause$subexpression$1$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "select_clause$subexpression$1",
                symbols: ["all_columns_asterisk", "select_clause$subexpression$1$ebnf$1"]
            }, {
                name: "select_clause$subexpression$1$ebnf$2",
                symbols: []
            }, {
                name: "select_clause$subexpression$1$ebnf$2",
                symbols: ["select_clause$subexpression$1$ebnf$2", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "select_clause$subexpression$1",
                symbols: ["asteriskless_free_form_sql", "select_clause$subexpression$1$ebnf$2"]
            }, {
                name: "select_clause",
                symbols: [NA.has("RESERVED_SELECT") ? {
                    type: "RESERVED_SELECT"
                } : RESERVED_SELECT, "select_clause$subexpression$1"],
                postprocess: ([E,[T,R]])=>({
                    type: AA.clause,
                    nameKw: IA(E),
                    children: [T, ...R]
                })
            }, {
                name: "select_clause",
                symbols: [NA.has("RESERVED_SELECT") ? {
                    type: "RESERVED_SELECT"
                } : RESERVED_SELECT],
                postprocess: ([E])=>({
                    type: AA.clause,
                    nameKw: IA(E),
                    children: []
                })
            }, {
                name: "all_columns_asterisk",
                symbols: [NA.has("ASTERISK") ? {
                    type: "ASTERISK"
                } : ASTERISK],
                postprocess: ()=>({
                    type: AA.all_columns_asterisk
                })
            }, {
                name: "other_clause$ebnf$1",
                symbols: []
            }, {
                name: "other_clause$ebnf$1",
                symbols: ["other_clause$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "other_clause",
                symbols: [NA.has("RESERVED_CLAUSE") ? {
                    type: "RESERVED_CLAUSE"
                } : RESERVED_CLAUSE, "other_clause$ebnf$1"],
                postprocess: ([E,T])=>({
                    type: AA.clause,
                    nameKw: IA(E),
                    children: T
                })
            }, {
                name: "set_operation$ebnf$1",
                symbols: []
            }, {
                name: "set_operation$ebnf$1",
                symbols: ["set_operation$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "set_operation",
                symbols: [NA.has("RESERVED_SET_OPERATION") ? {
                    type: "RESERVED_SET_OPERATION"
                } : RESERVED_SET_OPERATION, "set_operation$ebnf$1"],
                postprocess: ([E,T])=>({
                    type: AA.set_operation,
                    nameKw: IA(E),
                    children: T
                })
            }, {
                name: "expression_chain_$ebnf$1",
                symbols: ["expression_with_comments_"]
            }, {
                name: "expression_chain_$ebnf$1",
                symbols: ["expression_chain_$ebnf$1", "expression_with_comments_"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "expression_chain_",
                symbols: ["expression_chain_$ebnf$1"],
                postprocess: SA
            }, {
                name: "expression_chain$ebnf$1",
                symbols: []
            }, {
                name: "expression_chain$ebnf$1",
                symbols: ["expression_chain$ebnf$1", "_expression_with_comments"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "expression_chain",
                symbols: ["expression", "expression_chain$ebnf$1"],
                postprocess: ([E,T])=>[E, ...T]
            }, {
                name: "andless_expression_chain$ebnf$1",
                symbols: []
            }, {
                name: "andless_expression_chain$ebnf$1",
                symbols: ["andless_expression_chain$ebnf$1", "_andless_expression_with_comments"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "andless_expression_chain",
                symbols: ["andless_expression", "andless_expression_chain$ebnf$1"],
                postprocess: ([E,T])=>[E, ...T]
            }, {
                name: "expression_with_comments_",
                symbols: ["expression", "_"],
                postprocess: ([E,T])=>LA(E, {
                    trailing: T
                })
            }, {
                name: "_expression_with_comments",
                symbols: ["_", "expression"],
                postprocess: ([E,T])=>LA(T, {
                    leading: E
                })
            }, {
                name: "_andless_expression_with_comments",
                symbols: ["_", "andless_expression"],
                postprocess: ([E,T])=>LA(T, {
                    leading: E
                })
            }, {
                name: "free_form_sql$subexpression$1",
                symbols: ["asteriskless_free_form_sql"]
            }, {
                name: "free_form_sql$subexpression$1",
                symbols: ["asterisk"]
            }, {
                name: "free_form_sql",
                symbols: ["free_form_sql$subexpression$1"],
                postprocess: OA
            }, {
                name: "asteriskless_free_form_sql$subexpression$1",
                symbols: ["asteriskless_andless_expression"]
            }, {
                name: "asteriskless_free_form_sql$subexpression$1",
                symbols: ["logic_operator"]
            }, {
                name: "asteriskless_free_form_sql$subexpression$1",
                symbols: ["comma"]
            }, {
                name: "asteriskless_free_form_sql$subexpression$1",
                symbols: ["comment"]
            }, {
                name: "asteriskless_free_form_sql$subexpression$1",
                symbols: ["other_keyword"]
            }, {
                name: "asteriskless_free_form_sql",
                symbols: ["asteriskless_free_form_sql$subexpression$1"],
                postprocess: OA
            }, {
                name: "expression$subexpression$1",
                symbols: ["andless_expression"]
            }, {
                name: "expression$subexpression$1",
                symbols: ["logic_operator"]
            }, {
                name: "expression",
                symbols: ["expression$subexpression$1"],
                postprocess: OA
            }, {
                name: "andless_expression$subexpression$1",
                symbols: ["asteriskless_andless_expression"]
            }, {
                name: "andless_expression$subexpression$1",
                symbols: ["asterisk"]
            }, {
                name: "andless_expression",
                symbols: ["andless_expression$subexpression$1"],
                postprocess: OA
            }, {
                name: "asteriskless_andless_expression$subexpression$1",
                symbols: ["atomic_expression"]
            }, {
                name: "asteriskless_andless_expression$subexpression$1",
                symbols: ["between_predicate"]
            }, {
                name: "asteriskless_andless_expression$subexpression$1",
                symbols: ["case_expression"]
            }, {
                name: "asteriskless_andless_expression",
                symbols: ["asteriskless_andless_expression$subexpression$1"],
                postprocess: OA
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["array_subscript"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["function_call"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["property_access"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["parenthesis"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["curly_braces"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["square_brackets"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["operator"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["identifier"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["parameter"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["literal"]
            }, {
                name: "atomic_expression$subexpression$1",
                symbols: ["keyword"]
            }, {
                name: "atomic_expression",
                symbols: ["atomic_expression$subexpression$1"],
                postprocess: OA
            }, {
                name: "array_subscript",
                symbols: [NA.has("ARRAY_IDENTIFIER") ? {
                    type: "ARRAY_IDENTIFIER"
                } : ARRAY_IDENTIFIER, "_", "square_brackets"],
                postprocess: ([E,T,R])=>({
                    type: AA.array_subscript,
                    array: LA({
                        type: AA.identifier,
                        quoted: !1,
                        text: E.text
                    }, {
                        trailing: T
                    }),
                    parenthesis: R
                })
            }, {
                name: "array_subscript",
                symbols: [NA.has("ARRAY_KEYWORD") ? {
                    type: "ARRAY_KEYWORD"
                } : ARRAY_KEYWORD, "_", "square_brackets"],
                postprocess: ([E,T,R])=>({
                    type: AA.array_subscript,
                    array: LA(IA(E), {
                        trailing: T
                    }),
                    parenthesis: R
                })
            }, {
                name: "function_call",
                symbols: [NA.has("RESERVED_FUNCTION_NAME") ? {
                    type: "RESERVED_FUNCTION_NAME"
                } : RESERVED_FUNCTION_NAME, "_", "parenthesis"],
                postprocess: ([E,T,R])=>({
                    type: AA.function_call,
                    nameKw: LA(IA(E), {
                        trailing: T
                    }),
                    parenthesis: R
                })
            }, {
                name: "parenthesis",
                symbols: [{
                    literal: "("
                }, "expressions_or_clauses", {
                    literal: ")"
                }],
                postprocess: ([E,T,R])=>({
                    type: AA.parenthesis,
                    children: T,
                    openParen: "(",
                    closeParen: ")"
                })
            }, {
                name: "curly_braces$ebnf$1",
                symbols: []
            }, {
                name: "curly_braces$ebnf$1",
                symbols: ["curly_braces$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "curly_braces",
                symbols: [{
                    literal: "{"
                }, "curly_braces$ebnf$1", {
                    literal: "}"
                }],
                postprocess: ([E,T,R])=>({
                    type: AA.parenthesis,
                    children: T,
                    openParen: "{",
                    closeParen: "}"
                })
            }, {
                name: "square_brackets$ebnf$1",
                symbols: []
            }, {
                name: "square_brackets$ebnf$1",
                symbols: ["square_brackets$ebnf$1", "free_form_sql"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "square_brackets",
                symbols: [{
                    literal: "["
                }, "square_brackets$ebnf$1", {
                    literal: "]"
                }],
                postprocess: ([E,T,R])=>({
                    type: AA.parenthesis,
                    children: T,
                    openParen: "[",
                    closeParen: "]"
                })
            }, {
                name: "property_access$subexpression$1",
                symbols: ["identifier"]
            }, {
                name: "property_access$subexpression$1",
                symbols: ["array_subscript"]
            }, {
                name: "property_access$subexpression$1",
                symbols: ["all_columns_asterisk"]
            }, {
                name: "property_access$subexpression$1",
                symbols: ["parameter"]
            }, {
                name: "property_access",
                symbols: ["atomic_expression", "_", NA.has("DOT") ? {
                    type: "DOT"
                } : DOT, "_", "property_access$subexpression$1"],
                postprocess: ([E,T,R,A,[S]])=>({
                    type: AA.property_access,
                    object: LA(E, {
                        trailing: T
                    }),
                    property: LA(S, {
                        leading: A
                    })
                })
            }, {
                name: "between_predicate",
                symbols: [NA.has("BETWEEN") ? {
                    type: "BETWEEN"
                } : BETWEEN, "_", "andless_expression_chain", "_", NA.has("AND") ? {
                    type: "AND"
                } : AND, "_", "andless_expression"],
                postprocess: ([E,T,R,A,S,N,O])=>({
                    type: AA.between_predicate,
                    betweenKw: IA(E),
                    expr1: CA(R, {
                        leading: T,
                        trailing: A
                    }),
                    andKw: IA(S),
                    expr2: [LA(O, {
                        leading: N
                    })]
                })
            }, {
                name: "case_expression$ebnf$1",
                symbols: ["expression_chain_"],
                postprocess: SA
            }, {
                name: "case_expression$ebnf$1",
                symbols: [],
                postprocess: ()=>null
            }, {
                name: "case_expression$ebnf$2",
                symbols: []
            }, {
                name: "case_expression$ebnf$2",
                symbols: ["case_expression$ebnf$2", "case_clause"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "case_expression",
                symbols: [NA.has("CASE") ? {
                    type: "CASE"
                } : CASE, "_", "case_expression$ebnf$1", "case_expression$ebnf$2", NA.has("END") ? {
                    type: "END"
                } : END],
                postprocess: ([E,T,R,A,S])=>({
                    type: AA.case_expression,
                    caseKw: LA(IA(E), {
                        trailing: T
                    }),
                    endKw: IA(S),
                    expr: R || [],
                    clauses: A
                })
            }, {
                name: "case_clause",
                symbols: [NA.has("WHEN") ? {
                    type: "WHEN"
                } : WHEN, "_", "expression_chain_", NA.has("THEN") ? {
                    type: "THEN"
                } : THEN, "_", "expression_chain_"],
                postprocess: ([E,T,R,A,S,N])=>({
                    type: AA.case_when,
                    whenKw: LA(IA(E), {
                        trailing: T
                    }),
                    thenKw: LA(IA(A), {
                        trailing: S
                    }),
                    condition: R,
                    result: N
                })
            }, {
                name: "case_clause",
                symbols: [NA.has("ELSE") ? {
                    type: "ELSE"
                } : ELSE, "_", "expression_chain_"],
                postprocess: ([E,T,R])=>({
                    type: AA.case_else,
                    elseKw: LA(IA(E), {
                        trailing: T
                    }),
                    result: R
                })
            }, {
                name: "comma$subexpression$1",
                symbols: [NA.has("COMMA") ? {
                    type: "COMMA"
                } : COMMA]
            }, {
                name: "comma",
                symbols: ["comma$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.comma
                })
            }, {
                name: "asterisk$subexpression$1",
                symbols: [NA.has("ASTERISK") ? {
                    type: "ASTERISK"
                } : ASTERISK]
            }, {
                name: "asterisk",
                symbols: ["asterisk$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.operator,
                    text: E.text
                })
            }, {
                name: "operator$subexpression$1",
                symbols: [NA.has("OPERATOR") ? {
                    type: "OPERATOR"
                } : OPERATOR]
            }, {
                name: "operator",
                symbols: ["operator$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.operator,
                    text: E.text
                })
            }, {
                name: "identifier$subexpression$1",
                symbols: [NA.has("IDENTIFIER") ? {
                    type: "IDENTIFIER"
                } : IDENTIFIER]
            }, {
                name: "identifier$subexpression$1",
                symbols: [NA.has("QUOTED_IDENTIFIER") ? {
                    type: "QUOTED_IDENTIFIER"
                } : QUOTED_IDENTIFIER]
            }, {
                name: "identifier$subexpression$1",
                symbols: [NA.has("VARIABLE") ? {
                    type: "VARIABLE"
                } : VARIABLE]
            }, {
                name: "identifier",
                symbols: ["identifier$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.identifier,
                    quoted: "IDENTIFIER" !== E.type,
                    text: E.text
                })
            }, {
                name: "parameter$subexpression$1",
                symbols: [NA.has("NAMED_PARAMETER") ? {
                    type: "NAMED_PARAMETER"
                } : NAMED_PARAMETER]
            }, {
                name: "parameter$subexpression$1",
                symbols: [NA.has("QUOTED_PARAMETER") ? {
                    type: "QUOTED_PARAMETER"
                } : QUOTED_PARAMETER]
            }, {
                name: "parameter$subexpression$1",
                symbols: [NA.has("NUMBERED_PARAMETER") ? {
                    type: "NUMBERED_PARAMETER"
                } : NUMBERED_PARAMETER]
            }, {
                name: "parameter$subexpression$1",
                symbols: [NA.has("POSITIONAL_PARAMETER") ? {
                    type: "POSITIONAL_PARAMETER"
                } : POSITIONAL_PARAMETER]
            }, {
                name: "parameter$subexpression$1",
                symbols: [NA.has("CUSTOM_PARAMETER") ? {
                    type: "CUSTOM_PARAMETER"
                } : CUSTOM_PARAMETER]
            }, {
                name: "parameter",
                symbols: ["parameter$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.parameter,
                    key: E.key,
                    text: E.text
                })
            }, {
                name: "literal$subexpression$1",
                symbols: [NA.has("NUMBER") ? {
                    type: "NUMBER"
                } : NUMBER]
            }, {
                name: "literal$subexpression$1",
                symbols: [NA.has("STRING") ? {
                    type: "STRING"
                } : STRING]
            }, {
                name: "literal",
                symbols: ["literal$subexpression$1"],
                postprocess: ([[E]])=>({
                    type: AA.literal,
                    text: E.text
                })
            }, {
                name: "keyword$subexpression$1",
                symbols: [NA.has("RESERVED_KEYWORD") ? {
                    type: "RESERVED_KEYWORD"
                } : RESERVED_KEYWORD]
            }, {
                name: "keyword$subexpression$1",
                symbols: [NA.has("RESERVED_PHRASE") ? {
                    type: "RESERVED_PHRASE"
                } : RESERVED_PHRASE]
            }, {
                name: "keyword$subexpression$1",
                symbols: [NA.has("RESERVED_JOIN") ? {
                    type: "RESERVED_JOIN"
                } : RESERVED_JOIN]
            }, {
                name: "keyword",
                symbols: ["keyword$subexpression$1"],
                postprocess: ([[E]])=>IA(E)
            }, {
                name: "logic_operator$subexpression$1",
                symbols: [NA.has("AND") ? {
                    type: "AND"
                } : AND]
            }, {
                name: "logic_operator$subexpression$1",
                symbols: [NA.has("OR") ? {
                    type: "OR"
                } : OR]
            }, {
                name: "logic_operator$subexpression$1",
                symbols: [NA.has("XOR") ? {
                    type: "XOR"
                } : XOR]
            }, {
                name: "logic_operator",
                symbols: ["logic_operator$subexpression$1"],
                postprocess: ([[E]])=>IA(E)
            }, {
                name: "other_keyword$subexpression$1",
                symbols: [NA.has("WHEN") ? {
                    type: "WHEN"
                } : WHEN]
            }, {
                name: "other_keyword$subexpression$1",
                symbols: [NA.has("THEN") ? {
                    type: "THEN"
                } : THEN]
            }, {
                name: "other_keyword$subexpression$1",
                symbols: [NA.has("ELSE") ? {
                    type: "ELSE"
                } : ELSE]
            }, {
                name: "other_keyword$subexpression$1",
                symbols: [NA.has("END") ? {
                    type: "END"
                } : END]
            }, {
                name: "other_keyword",
                symbols: ["other_keyword$subexpression$1"],
                postprocess: ([[E]])=>IA(E)
            }, {
                name: "_$ebnf$1",
                symbols: []
            }, {
                name: "_$ebnf$1",
                symbols: ["_$ebnf$1", "comment"],
                postprocess: E=>E[0].concat([E[1]])
            }, {
                name: "_",
                symbols: ["_$ebnf$1"],
                postprocess: ([E])=>E
            }, {
                name: "comment",
                symbols: [NA.has("LINE_COMMENT") ? {
                    type: "LINE_COMMENT"
                } : LINE_COMMENT],
                postprocess: ([E])=>({
                    type: AA.line_comment,
                    text: E.text,
                    precedingWhitespace: E.precedingWhitespace
                })
            }, {
                name: "comment",
                symbols: [NA.has("BLOCK_COMMENT") ? {
                    type: "BLOCK_COMMENT"
                } : BLOCK_COMMENT],
                postprocess: ([E])=>({
                    type: AA.block_comment,
                    text: E.text,
                    precedingWhitespace: E.precedingWhitespace
                })
            }],
            ParserStart: "main"
        }
          , eA = _A
          , {Parser: PA, Grammar: DA} = wR();
        var sA;
        !function(E) {
            E[E.SPACE = 0] = "SPACE",
            E[E.NO_SPACE = 1] = "NO_SPACE",
            E[E.NO_NEWLINE = 2] = "NO_NEWLINE",
            E[E.NEWLINE = 3] = "NEWLINE",
            E[E.MANDATORY_NEWLINE = 4] = "MANDATORY_NEWLINE",
            E[E.INDENT = 5] = "INDENT",
            E[E.SINGLE_INDENT = 6] = "SINGLE_INDENT"
        }(sA = sA || (sA = {}));
        class MA {
            constructor(E) {
                this.indentation = E,
                this.items = []
            }
            add(...E) {
                for (const T of E)
                    switch (T) {
                    case sA.SPACE:
                        this.items.push(sA.SPACE);
                        break;
                    case sA.NO_SPACE:
                        this.trimHorizontalWhitespace();
                        break;
                    case sA.NO_NEWLINE:
                        this.trimWhitespace();
                        break;
                    case sA.NEWLINE:
                        this.trimHorizontalWhitespace(),
                        this.addNewline(sA.NEWLINE);
                        break;
                    case sA.MANDATORY_NEWLINE:
                        this.trimHorizontalWhitespace(),
                        this.addNewline(sA.MANDATORY_NEWLINE);
                        break;
                    case sA.INDENT:
                        this.addIndentation();
                        break;
                    case sA.SINGLE_INDENT:
                        this.items.push(sA.SINGLE_INDENT);
                        break;
                    default:
                        this.items.push(T)
                    }
            }
            trimHorizontalWhitespace() {
                for (; UA(n(this.items)); )
                    this.items.pop()
            }
            trimWhitespace() {
                for (; tA(n(this.items)); )
                    this.items.pop()
            }
            addNewline(E) {
                if (this.items.length > 0)
                    switch (n(this.items)) {
                    case sA.NEWLINE:
                        this.items.pop(),
                        this.items.push(E);
                        break;
                    case sA.MANDATORY_NEWLINE:
                        break;
                    default:
                        this.items.push(E)
                    }
            }
            addIndentation() {
                for (let E = 0; E < this.indentation.getLevel(); E++)
                    this.items.push(sA.SINGLE_INDENT)
            }
            toString() {
                return this.items.map((E=>this.itemToString(E))).join("")
            }
            getLayoutItems() {
                return this.items
            }
            itemToString(E) {
                switch (E) {
                case sA.SPACE:
                    return " ";
                case sA.NEWLINE:
                case sA.MANDATORY_NEWLINE:
                    return "\n";
                case sA.SINGLE_INDENT:
                    return this.indentation.getSingleIndent();
                default:
                    return E
                }
            }
        }
        const UA = E=>E === sA.SPACE || E === sA.SINGLE_INDENT
          , tA = E=>E === sA.SPACE || E === sA.SINGLE_INDENT || E === sA.NEWLINE;
        const rA = "top-level";
        class GA {
            constructor(E) {
                this.indent = E,
                this.indentTypes = []
            }
            getSingleIndent() {
                return this.indent
            }
            getLevel() {
                return this.indentTypes.length
            }
            increaseTopLevel() {
                this.indentTypes.push(rA)
            }
            increaseBlockLevel() {
                this.indentTypes.push("block-level")
            }
            decreaseTopLevel() {
                this.indentTypes.length > 0 && n(this.indentTypes) === rA && this.indentTypes.pop()
            }
            decreaseBlockLevel() {
                for (; this.indentTypes.length > 0 && this.indentTypes.pop() === rA; )
                    ;
            }
        }
        class nA extends MA {
            constructor(E) {
                super(new GA("")),
                this.expressionWidth = E,
                this.length = 0,
                this.trailingSpace = !1
            }
            add(...E) {
                if (E.forEach((E=>this.addToLength(E))),
                this.length > this.expressionWidth)
                    throw new iA;
                super.add(...E)
            }
            addToLength(E) {
                if ("string" == typeof E)
                    this.length += E.length,
                    this.trailingSpace = !1;
                else {
                    if (E === sA.MANDATORY_NEWLINE || E === sA.NEWLINE)
                        throw new iA;
                    E === sA.INDENT || E === sA.SINGLE_INDENT || E === sA.SPACE ? this.trailingSpace || (this.length++,
                    this.trailingSpace = !0) : E !== sA.NO_NEWLINE && E !== sA.NO_SPACE || this.trailingSpace && (this.trailingSpace = !1,
                    this.length--)
                }
            }
        }
        class iA extends Error {
        }
        class aA {
            constructor({cfg: E, dialectCfg: T, params: R, layout: A, inline: S=!1}) {
                this.inline = !1,
                this.nodes = [],
                this.index = -1,
                this.cfg = E,
                this.dialectCfg = T,
                this.inline = S,
                this.params = R,
                this.layout = A
            }
            format(E) {
                for (this.nodes = E,
                this.index = 0; this.index < this.nodes.length; this.index++)
                    this.formatNode(this.nodes[this.index]);
                return this.layout
            }
            formatNode(E) {
                this.formatComments(E.leadingComments),
                this.formatNodeWithoutComments(E),
                this.formatComments(E.trailingComments)
            }
            formatNodeWithoutComments(E) {
                switch (E.type) {
                case AA.function_call:
                    return this.formatFunctionCall(E);
                case AA.array_subscript:
                    return this.formatArraySubscript(E);
                case AA.property_access:
                    return this.formatPropertyAccess(E);
                case AA.parenthesis:
                    return this.formatParenthesis(E);
                case AA.between_predicate:
                    return this.formatBetweenPredicate(E);
                case AA.case_expression:
                    return this.formatCaseExpression(E);
                case AA.case_when:
                    return this.formatCaseWhen(E);
                case AA.case_else:
                    return this.formatCaseElse(E);
                case AA.clause:
                    return this.formatClause(E);
                case AA.set_operation:
                    return this.formatSetOperation(E);
                case AA.limit_clause:
                    return this.formatLimitClause(E);
                case AA.all_columns_asterisk:
                    return this.formatAllColumnsAsterisk(E);
                case AA.literal:
                    return this.formatLiteral(E);
                case AA.identifier:
                    return this.formatIdentifier(E);
                case AA.parameter:
                    return this.formatParameter(E);
                case AA.operator:
                    return this.formatOperator(E);
                case AA.comma:
                    return this.formatComma(E);
                case AA.line_comment:
                    return this.formatLineComment(E);
                case AA.block_comment:
                    return this.formatBlockComment(E);
                case AA.keyword:
                    return this.formatKeywordNode(E)
                }
            }
            formatFunctionCall(E) {
                this.withComments(E.nameKw, (()=>{
                    this.layout.add(this.showKw(E.nameKw))
                }
                )),
                this.formatNode(E.parenthesis)
            }
            formatArraySubscript(E) {
                this.withComments(E.array, (()=>{
                    this.layout.add(E.array.type === AA.keyword ? this.showKw(E.array) : this.showIdentifier(E.array))
                }
                )),
                this.formatNode(E.parenthesis)
            }
            formatPropertyAccess(E) {
                this.formatNode(E.object),
                this.layout.add(sA.NO_SPACE, "."),
                this.formatNode(E.property)
            }
            formatParenthesis(E) {
                const T = this.formatInlineExpression(E.children);
                T ? (this.layout.add(E.openParen),
                this.layout.add(...T.getLayoutItems()),
                this.layout.add(sA.NO_SPACE, E.closeParen, sA.SPACE)) : (this.layout.add(E.openParen, sA.NEWLINE),
                JR(this.cfg) ? (this.layout.add(sA.INDENT),
                this.layout = this.formatSubExpression(E.children)) : (this.layout.indentation.increaseBlockLevel(),
                this.layout.add(sA.INDENT),
                this.layout = this.formatSubExpression(E.children),
                this.layout.indentation.decreaseBlockLevel()),
                this.layout.add(sA.NEWLINE, sA.INDENT, E.closeParen, sA.SPACE))
            }
            formatBetweenPredicate(E) {
                this.layout.add(this.showKw(E.betweenKw), sA.SPACE),
                this.layout = this.formatSubExpression(E.expr1),
                this.layout.add(sA.NO_SPACE, sA.SPACE, this.showNonTabularKw(E.andKw), sA.SPACE),
                this.layout = this.formatSubExpression(E.expr2),
                this.layout.add(sA.SPACE)
            }
            formatCaseExpression(E) {
                this.formatNode(E.caseKw),
                this.layout.indentation.increaseBlockLevel(),
                this.layout = this.formatSubExpression(E.expr),
                this.layout = this.formatSubExpression(E.clauses),
                this.layout.indentation.decreaseBlockLevel(),
                this.layout.add(sA.NEWLINE, sA.INDENT),
                this.formatNode(E.endKw)
            }
            formatCaseWhen(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT),
                this.formatNode(E.whenKw),
                this.layout = this.formatSubExpression(E.condition),
                this.formatNode(E.thenKw),
                this.layout = this.formatSubExpression(E.result)
            }
            formatCaseElse(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT),
                this.formatNode(E.elseKw),
                this.layout = this.formatSubExpression(E.result)
            }
            formatClause(E) {
                this.isOnelineClause(E) ? this.formatClauseInOnelineStyle(E) : JR(this.cfg) ? this.formatClauseInTabularStyle(E) : this.formatClauseInIndentedStyle(E)
            }
            isOnelineClause(E) {
                return this.dialectCfg.onelineClauses[E.nameKw.text]
            }
            formatClauseInIndentedStyle(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E.nameKw), sA.NEWLINE),
                this.layout.indentation.increaseTopLevel(),
                this.layout.add(sA.INDENT),
                this.layout = this.formatSubExpression(E.children),
                this.layout.indentation.decreaseTopLevel()
            }
            formatClauseInOnelineStyle(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E.nameKw), sA.SPACE),
                this.layout = this.formatSubExpression(E.children)
            }
            formatClauseInTabularStyle(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E.nameKw), sA.SPACE),
                this.layout.indentation.increaseTopLevel(),
                this.layout = this.formatSubExpression(E.children),
                this.layout.indentation.decreaseTopLevel()
            }
            formatSetOperation(E) {
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E.nameKw), sA.NEWLINE),
                this.layout.add(sA.INDENT),
                this.layout = this.formatSubExpression(E.children)
            }
            formatLimitClause(E) {
                this.withComments(E.limitKw, (()=>{
                    this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E.limitKw))
                }
                )),
                this.layout.indentation.increaseTopLevel(),
                JR(this.cfg) ? this.layout.add(sA.SPACE) : this.layout.add(sA.NEWLINE, sA.INDENT),
                E.offset ? (this.layout = this.formatSubExpression(E.offset),
                this.layout.add(sA.NO_SPACE, ",", sA.SPACE),
                this.layout = this.formatSubExpression(E.count)) : this.layout = this.formatSubExpression(E.count),
                this.layout.indentation.decreaseTopLevel()
            }
            formatAllColumnsAsterisk(E) {
                this.layout.add("*", sA.SPACE)
            }
            formatLiteral(E) {
                this.layout.add(E.text, sA.SPACE)
            }
            formatIdentifier(E) {
                this.layout.add(this.showIdentifier(E), sA.SPACE)
            }
            formatParameter(E) {
                this.layout.add(this.params.get(E), sA.SPACE)
            }
            formatOperator({text: E}) {
                this.cfg.denseOperators || this.dialectCfg.alwaysDenseOperators.includes(E) ? this.layout.add(sA.NO_SPACE, E) : ":" === E ? this.layout.add(sA.NO_SPACE, E, sA.SPACE) : this.layout.add(E, sA.SPACE)
            }
            formatComma(E) {
                this.inline ? this.layout.add(sA.NO_SPACE, ",", sA.SPACE) : this.layout.add(sA.NO_SPACE, ",", sA.NEWLINE, sA.INDENT)
            }
            withComments(E, T) {
                this.formatComments(E.leadingComments),
                T(),
                this.formatComments(E.trailingComments)
            }
            formatComments(E) {
                E && E.forEach((E=>{
                    E.type === AA.line_comment ? this.formatLineComment(E) : this.formatBlockComment(E)
                }
                ))
            }
            formatLineComment(E) {
                H(E.precedingWhitespace || "") ? this.layout.add(sA.NEWLINE, sA.INDENT, E.text, sA.MANDATORY_NEWLINE, sA.INDENT) : this.layout.getLayoutItems().length > 0 ? this.layout.add(sA.NO_NEWLINE, sA.SPACE, E.text, sA.MANDATORY_NEWLINE, sA.INDENT) : this.layout.add(E.text, sA.MANDATORY_NEWLINE, sA.INDENT)
            }
            formatBlockComment(E) {
                this.isMultilineBlockComment(E) ? (this.splitBlockComment(E.text).forEach((E=>{
                    this.layout.add(sA.NEWLINE, sA.INDENT, E)
                }
                )),
                this.layout.add(sA.NEWLINE, sA.INDENT)) : this.layout.add(E.text, sA.SPACE)
            }
            isMultilineBlockComment(E) {
                return H(E.text) || H(E.precedingWhitespace || "")
            }
            isDocComment(E) {
                const T = E.split(/\n/);
                return /^\/\*\*?$/.test(T[0]) && T.slice(1, T.length - 1).every((E=>/^\s*\*/.test(E))) && /^\s*\*\/$/.test(n(T))
            }
            splitBlockComment(E) {
                return this.isDocComment(E) ? E.split(/\n/).map((E=>/^\s*\*/.test(E) ? " " + E.replace(/^\s*/, "") : E)) : E.split(/\n/).map((E=>E.replace(/^\s*/, "")))
            }
            formatSubExpression(E) {
                return new aA({
                    cfg: this.cfg,
                    dialectCfg: this.dialectCfg,
                    params: this.params,
                    layout: this.layout,
                    inline: this.inline
                }).format(E)
            }
            formatInlineExpression(E) {
                const T = this.params.getPositionalParameterIndex();
                try {
                    return new aA({
                        cfg: this.cfg,
                        dialectCfg: this.dialectCfg,
                        params: this.params,
                        layout: new nA(this.cfg.expressionWidth),
                        inline: !0
                    }).format(E)
                } catch (E) {
                    if (E instanceof iA)
                        return void this.params.setPositionalParameterIndex(T);
                    throw E
                }
            }
            formatKeywordNode(T) {
                switch (T.tokenType) {
                case E.RESERVED_JOIN:
                    return this.formatJoin(T);
                case E.AND:
                case E.OR:
                case E.XOR:
                    return this.formatLogicalOperator(T);
                default:
                    return this.formatKeyword(T)
                }
            }
            formatJoin(E) {
                JR(this.cfg) ? (this.layout.indentation.decreaseTopLevel(),
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E), sA.SPACE),
                this.layout.indentation.increaseTopLevel()) : this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E), sA.SPACE)
            }
            formatKeyword(E) {
                this.layout.add(this.showKw(E), sA.SPACE)
            }
            formatLogicalOperator(E) {
                "before" === this.cfg.logicalOperatorNewline ? JR(this.cfg) ? (this.layout.indentation.decreaseTopLevel(),
                this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E), sA.SPACE),
                this.layout.indentation.increaseTopLevel()) : this.layout.add(sA.NEWLINE, sA.INDENT, this.showKw(E), sA.SPACE) : this.layout.add(this.showKw(E), sA.NEWLINE, sA.INDENT)
            }
            showKw(T) {
                return (T=>T === E.AND || T === E.OR || T === E.XOR)(R = T.tokenType) || R === E.RESERVED_CLAUSE || R === E.RESERVED_SELECT || R === E.RESERVED_SET_OPERATION || R === E.RESERVED_JOIN || R === E.LIMIT ? function(E, T) {
                    if ("standard" === T)
                        return E;
                    let R = [];
                    return E.length >= 10 && E.includes(" ") && ([E,...R] = E.split(" ")),
                    (E = "tabularLeft" === T ? E.padEnd(9, " ") : E.padStart(9, " ")) + ["", ...R].join(" ")
                }(this.showNonTabularKw(T), this.cfg.indentStyle) : this.showNonTabularKw(T);
                var R
            }
            showNonTabularKw(E) {
                switch (this.cfg.keywordCase) {
                case "preserve":
                    return a(E.raw);
                case "upper":
                    return E.text;
                case "lower":
                    return E.text.toLowerCase()
                }
            }
            showIdentifier(E) {
                if (E.quoted)
                    return E.text;
                switch (this.cfg.identifierCase) {
                case "preserve":
                    return E.text;
                case "upper":
                    return E.text.toUpperCase();
                case "lower":
                    return E.text.toLowerCase()
                }
            }
        }
        class oA {
            constructor(E, T) {
                this.dialect = E,
                this.cfg = T,
                this.params = new gR(this.cfg.params)
            }
            format(E) {
                const T = this.parse(E);
                return this.formatAst(T).trimEnd()
            }
            parse(E) {
                return function(E) {
                    let T = {};
                    const R = new RA((R=>{
                        return [...(A = E.tokenize(R, T),
                        A.map(vR).map(QR).map(ZR).map(qR)), S(R.length)];
                        var A
                    }
                    ))
                      , A = new PA(DA.fromCompiled(eA),{
                        lexer: R
                    });
                    return {
                        parse: (E,R)=>{
                            T = R;
                            const {results: S} = A.feed(E);
                            if (1 === S.length)
                                return S[0];
                            throw 0 === S.length ? new Error("Parse error: Invalid SQL") : new Error(`Parse error: Ambiguous grammar\n ${JSON.stringify(S, void 0, 2)}`)
                        }
                    }
                }(this.dialect.tokenizer).parse(E, this.cfg.paramTypes || {})
            }
            formatAst(E) {
                return E.map((E=>this.formatStatement(E))).join("\n".repeat(this.cfg.linesBetweenQueries + 1))
            }
            formatStatement(E) {
                const T = new aA({
                    cfg: this.cfg,
                    dialectCfg: this.dialect.formatOptions,
                    params: this.params,
                    layout: new MA(new GA((R = this.cfg,
                    "tabularLeft" === R.indentStyle || "tabularRight" === R.indentStyle ? " ".repeat(10) : R.useTabs ? "\t" : " ".repeat(R.tabWidth))))
                }).format(E.children);
                var R;
                return E.hasSemicolon && (this.cfg.newlineBeforeSemicolon ? T.add(sA.NEWLINE, ";") : T.add(sA.NO_NEWLINE, ";")),
                T.toString()
            }
        }
        class HA extends Error {
        }
        const BA = {
            bigquery: "bigquery",
            db2: "db2",
            db2i: "db2i",
            hive: "hive",
            mariadb: "mariadb",
            mysql: "mysql",
            n1ql: "n1ql",
            plsql: "plsql",
            postgresql: "postgresql",
            redshift: "redshift",
            spark: "spark",
            sqlite: "sqlite",
            sql: "sql",
            trino: "trino",
            transactsql: "transactsql",
            tsql: "transactsql",
            singlestoredb: "singlestoredb",
            snowflake: "snowflake"
        }
          , FA = Object.keys(BA)
          , YA = {
            tabWidth: 2,
            useTabs: !1,
            keywordCase: "preserve",
            identifierCase: "preserve",
            indentStyle: "standard",
            logicalOperatorNewline: "before",
            expressionWidth: 50,
            linesBetweenQueries: 1,
            denseOperators: !1,
            newlineBeforeSemicolon: !1
        }
          , lA = (E,R={})=>{
            if ("string" == typeof R.language && !FA.includes(R.language))
                throw new HA(`Unsupported SQL dialect: ${R.language}`);
            const A = BA[R.language || "sql"];
            return VA(E, Object.assign(Object.assign({}, R), {
                dialect: T[A]
            }))
        }
          , VA = (E,T)=>{
            var {dialect: R} = T
              , A = function(E, T) {
                var R = {};
                for (var A in E)
                    Object.prototype.hasOwnProperty.call(E, A) && T.indexOf(A) < 0 && (R[A] = E[A]);
                if (null != E && "function" == typeof Object.getOwnPropertySymbols) {
                    var S = 0;
                    for (A = Object.getOwnPropertySymbols(E); S < A.length; S++)
                        T.indexOf(A[S]) < 0 && Object.prototype.propertyIsEnumerable.call(E, A[S]) && (R[A[S]] = E[A[S]])
                }
                return R
            }(T, ["dialect"]);
            if ("string" != typeof E)
                throw new Error("Invalid query argument. Expected string, instead got " + typeof E);
            const S = function(E) {
                const T = ["multilineLists", "newlineBeforeOpenParen", "newlineBeforeCloseParen", "aliasAs", "commaPosition", "tabulateAlias"];
                for (const R of T)
                    if (R in E)
                        throw new HA(`${R} config is no more supported.`);
                if (E.expressionWidth <= 0)
                    throw new HA(`expressionWidth config must be positive number. Received ${E.expressionWidth} instead.`);
                var R;
                return E.params && !((R = E.params)instanceof Array ? R : Object.values(R)).every((E=>"string" == typeof E)) && console.warn('WARNING: All "params" option values should be strings.'),
                E
            }(Object.assign(Object.assign({}, YA), A));
            return new oA((E=>{
                let T = bR.get(E);
                return T || (T = {
                    tokenizer: new yR((R = E).tokenizerOptions,R.name),
                    formatOptions: xR(R.formatOptions)
                },
                bR.set(E, T)),
                T;
                var R
            }
            )(R),S).format(E)
        }
    }
    )(),
    A
}
)()));
//# sourceMappingURL=sql-formatter.min.cjs.map
