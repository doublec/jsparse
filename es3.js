// Copyright (C) 2007 Chris Double.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// DEVELOPERS AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

// Forward Declarations
var SourceElement = 
    function(input) { return SourceElement(input); }
var AssignmentExpression = 
    function(input) { return AssignmentExpression(input); }
var Expression = 
    function(input) { return Expression(input); }
var Statement = 
    function(input) { return Statement(input); }
var LeftHandSideExpression = 
    function(input) { return LeftHandSideExpression(input); }

var Whitespace = choice("\t", " ");
var LineTerminator = choice(ch("\r"), ch("\n"));

var SingleLineCommentChars = join_action(repeat1(negate(LineTerminator)), "");
var SingleLineComment = sequence("//", optional(SingleLineCommentChars), LineTerminator);

var Comment =
    choice(SingleLineComment);

var NullLiteral = token("null");
var BooleanLiteral = choice("true", "false");
var Zero = action("0", function(ast) { return 0; });
var DecimalDigit = action(range("0", "9"), function(ast) { return parseInt(ast); });
var NonZeroDigit = action(range("1", "9"), function(ast) { return parseInt(ast); });
var DecimalDigits = repeat1(DecimalDigit); 
var DecimalIntegerLiteral = choice(Zero, sequence(NonZeroDigit, optional(DecimalDigits)));
var SignedInteger = choice(DecimalDigits, sequence("+", DecimalDigits), sequence("-", DecimalDigits));
var ExponentIndicator = choice("e", "E");
var ExponentPart = sequence(ExponentIndicator, SignedInteger);
var DecimalLiteral = choice(sequence(DecimalIntegerLiteral, ".", optional(DecimalDigits), optional(ExponentPart)),
			       sequence(".", DecimalDigits, optional(ExponentPart)),
				sequence(DecimalIntegerLiteral, optional(ExponentPart)));

var HexDigit = choice(range("0", "9"), range("a", "f"), range("A", "F"));
var HexIntegerLiteral = sequence(choice("0x", "0X"), repeat1(HexDigit));
var NumericLiteral = choice(HexIntegerLiteral, DecimalLiteral);
var SingleEscapeCharacter = choice("'", "\"", "\\", "b", "f", "n", "r", "t", "v");
var NonEscapeCharacter = negate(SingleEscapeCharacter);

var CharacterEscapeSequence = choice(SingleEscapeCharacter, NonEscapeCharacter);
var HexEscapeSequence = sequence("x", HexDigit, HexDigit);
var UnicodeEscapeSequence = sequence("u", HexDigit, HexDigit, HexDigit, HexDigit);
var EscapeSequence = choice(HexEscapeSequence, UnicodeEscapeSequence, CharacterEscapeSequence);
var SingleStringCharacter = choice(negate(choice("\'", "\\", "\r", "\n")),
					sequence("\\", EscapeSequence));
var DoubleStringCharacter = choice(negate(choice("\"", "\\", "\r", "\n")),
				      sequence("\\", EscapeSequence));
var SingleStringCharacters = repeat1(SingleStringCharacter);
var DoubleStringCharacters = repeat1(DoubleStringCharacter);

var StringLiteral = choice(sequence("\"", optional(DoubleStringCharacters), "\""),
			       sequence("'", optional(SingleStringCharacters), "'"));

var Literal = choice(NullLiteral, BooleanLiteral, NumericLiteral, StringLiteral);					       

var Keyword = 
    choice("break",
	      "case",
	      "catch",
	      "continue",
	      "default",
	      "delete",
	      "do",
	      "else",
	      "finally",
	      "for",
	      "function",
	      "if",
	      "in",
	      "instanceof",
	      "new",
	      "return",
	      "switch",
	      "this",
	      "throw",
	      "try",
	      "typeof",
	      "var",
	      "void",
	      "while",
	      "with");

var ReservedWord = choice(Keyword, NullLiteral, BooleanLiteral);

var HexDigit = choice(range("0", "9"), range("a", "f"), range("A", "F"));
var IdentifierLetter = choice(range("a", "z"), range("A", "Z"));
var IdentifierStart = choice(IdentifierLetter, "$", "_");
var IdentifierPart = choice(IdentifierStart, range("0-9"));
var IdentifierName = 
    action(sequence(IdentifierStart, join_action(repeat0(IdentifierPart), "")),
	   function(ast) { 
	       return ast[0].concat(ast[1]); 
	   });
var Identifier = butnot(IdentifierName, ReservedWord);

var StatementList = repeat1(Statement);
var Block = wsequence("{", optional(StatementList), "}");
var Initialiser = wsequence("=", AssignmentExpression);
var VariableDeclaration = wsequence(Identifier, optional(Initialiser));
var VariableDeclarationList = wlist(VariableDeclaration, ",");	      
var VariableStatement = 
    wsequence("var", VariableDeclarationList);

var EmptyStatement = token(";");

var IfStatement = 
    choice(wsequence("if", "(", Expression, ")", Statement, "else", Statement),
	      wsequence("if", "(", Expression, ")", Statement));

var IterationStatement =
    choice(wsequence("do", Statement, "while", "(", Expression, ")", ";"),
	      wsequence("while", "(", Expression, ")", Statement),
	      wsequence("for", "(", optional(Expression), ";", optional(Expression), ";", optional(Expression), ")", Statement),
	      wsequence("for", "(", "var", VariableDeclarationList, ";", optional(Expression), ";", optional(Expression), ")", Statement),
	      wsequence("for", "(", LeftHandSideExpression, "in", Expression, ")", Statement),
	      wsequence("for", "(", "var", VariableDeclaration, "in", Expression, ")", Statement));

var ContinueStatement = wsequence("continue", optional(Identifier), ";");
var BreakStatement = wsequence("break", optional(Identifier), ";");
var ReturnStatement = wsequence("return", optional(Expression), ";");
var WithStatement = wsequence("with", "(", Expression, ")", Statement);


var CaseClause =
    wsequence("case", Expression, ":", optional(StatementList));
var DefaultClause =
    wsequence("default", ":", optional(StatementList));
var CaseBlock =
    choice(wsequence("{", repeat0(CaseClause), "}"),
	      wsequence("{", repeat0(CaseClause), DefaultClause, repeat0(CaseClause), "}"));

var SwitchStatement = wsequence("switch", "(", Expression, ")", CaseBlock);
var LabelledStatement = wsequence(Identifier, ":", Statement);
var ThrowStatement = wsequence("throw", Expression, ";");

var Catch = wsequence("catch", "(", Identifier, ")", Block);
var Finally = wsequence("finally", Block);
var TryStatement = 
    choice(wsequence("try", Block, Catch),
	      wsequence("try", Block, Finally),
	      wsequence("try", Block, Catch, Finally));

var ExpressionStatement = 
    choice(sequence(choice("{", "function"), nothing_p),
	      Expression);
var Statement = 
    choice(Block,
	      VariableStatement,
	      EmptyStatement,
	      ExpressionStatement,
	      IfStatement,
	      IterationStatement,
	      ContinueStatement,
	      BreakStatement,
	      ReturnStatement,
	      WithStatement,
	      SwitchStatement,
	      LabelledStatement,
	      ThrowStatement,
	      TryStatement);

var FunctionDeclaration = 
    function(input) { return FunctionDeclaration(input); }

var FunctionBody = repeat0(SourceElement);
var FormalParameterList = wlist(Identifier, ",");	      
var FunctionExpression = 
    wsequence("function", optional(Identifier), "(", optional(FormalParameterList), ")", "{", FunctionBody, "}");

var FunctionDeclaration = 
    wsequence("function", Identifier, "(", optional(FormalParameterList), ")", "{", FunctionBody, "}");


var PrimaryExpression = 
    function(input) { return PrimaryExpression(input); }

var ArgumentList = list(AssignmentExpression, ",");       
var Arguments = 
    choice(wsequence("(", ")"),
	      wsequence("(", ArgumentList, ")"));

var MemberExpression = function(input) { return MemberExpression(input); }    
var MemberExpression =
    left_factor_action(sequence(choice(wsequence("new", MemberExpression, Arguments),
					  PrimaryExpression,
					  FunctionExpression),
				repeat0(choice(wsequence("[", Expression, "]"),
						  wsequence(".", Identifier)))));

var NewExpression = 
    choice(MemberExpression,
	      wsequence("new", NewExpression));
var CallExpression = 
    left_factor_action(wsequence(wsequence(MemberExpression, Arguments),
				repeat0(choice(Arguments,
						  wsequence("[", Expression, "]"),
						  wsequence(".", Identifier)))));
		      
var LeftHandSideExpression = choice(CallExpression, NewExpression);

var AssignmentOperator = 
    choice("=",
	      "*=",
	      "/=",
	      "%=",
	      "+=",
	      "-=",
	      "<<=",
	      ">>=",
	      ">>>=",
	      "&=",
	      "^=",
	      "|=");

var LogicalORExpression = 
    function(input) { return LogicalORExpression(input); }
var LogicalANDExpression = 
    function(input) { return LogicalANDExpression(input); }
var BitwiseORExpression = 
    function(input) { return BitwiseORExpression(input); }
var BitwiseXORExpression = 
    function(input) { return BitwiseXORExpression(input); }
var BitwiseANDExpression = 
    function(input) { return BitwiseANDExpression(input); }
var EqualityExpression = 
    function(input) { return EqualityExpression(input); }
var RelationalExpression = 
    function(input) { return RelationalExpression(input); }
var ShiftExpression = 
    function(input) { return ShiftExpression(input); }
var AdditiveExpression = 
    function(input) { return AdditiveExpression(input); }
var MultiplicativeExpression = 
    function(input) { return MultiplicativeExpression(input); }
var UnaryExpression = 
    function(input) { return UnaryExpression(input); }
var PostfixExpression = 
    function(input) { return PostfixExpression(input); }

var PostfixExpression =
    choice(wsequence(LeftHandSideExpression, "++"),
	      wsequence(LeftHandSideExpression, "--"),
	      LeftHandSideExpression);

var UnaryExpression =
    choice(PostfixExpression,
	      wsequence("delete", UnaryExpression),
	      wsequence("void", UnaryExpression),
	      wsequence("typeof", UnaryExpression),
	      wsequence("++", UnaryExpression),
	      wsequence("--", UnaryExpression),
	      wsequence("+", UnaryExpression),
	      wsequence("-", UnaryExpression),
	      wsequence("~", UnaryExpression),
	      wsequence("!", UnaryExpression));

var MultiplicativeExpression =
    wsequence(UnaryExpression,
	      repeat0(choice(wsequence("*", UnaryExpression),
				wsequence("/", UnaryExpression),
				wsequence("%", UnaryExpression))));

var AdditiveExpression =
    wsequence(MultiplicativeExpression,
	      repeat0(choice(wsequence("+", MultiplicativeExpression),
				wsequence("-", MultiplicativeExpression))));
	      
var ShiftExpression = 
    wsequence(AdditiveExpression,
	      repeat0(choice(wsequence("<<", AdditiveExpression),
				wsequence(">>", AdditiveExpression),
				wsequence(">>>", AdditiveExpression))));

var RelationalExpression =
    wsequence(ShiftExpression,
	      repeat0(choice(wsequence("<", ShiftExpression),
				wsequence(">", ShiftExpression),
				wsequence("<=", ShiftExpression),
				wsequence(">=", ShiftExpression),
				wsequence("instanceof", ShiftExpression))));

var EqualityExpression =
    wsequence(RelationalExpression, 
	      repeat0(choice(wsequence("==", RelationalExpression),
				wsequence("!==", RelationalExpression),
				wsequence("===", RelationalExpression),
				wsequence("!==", RelationalExpression))));

var BitwiseANDExpression = 
    wsequence(EqualityExpression, repeat0(wsequence("&", EqualityExpression)));
var BitwiseXORExpression = 
    wsequence(BitwiseANDExpression, repeat0(wsequence("^", BitwiseANDExpression)));
var BitwiseORExpression = 
    wsequence(BitwiseXORExpression, repeat0(wsequence("|", BitwiseXORExpression)));
var LogicalANDExpression = 
    wsequence(BitwiseORExpression, repeat0(wsequence("&&", BitwiseORExpression)));

var LogicalORExpression = 
    wsequence(LogicalANDExpression, repeat0(wsequence("||", LogicalANDExpression)));

var ConditionalExpression = 
    choice(LogicalORExpression,
	      wsequence(LogicalORExpression, "?", AssignmentExpression, ":", AssignmentExpression));

var AssignmentExpression = 
    choice(wsequence(LeftHandSideExpression, AssignmentOperator, AssignmentExpression),
	      ConditionalExpression);

var Expression = list(AssignmentExpression, ",");

var Elision = repeat1(","); 
var ElementList = list(wsequence(optional(Elision), AssignmentExpression), ",");
var ArrayLiteral = 
    choice(wsequence("[", optional(Elision), "]"),
	      wsequence("[", ElementList, "]"),
	      wsequence("[", ElementList, optional(Elision), "]"));

var PropertyName = choice(Identifier, StringLiteral, NumericLiteral);
var PropertyNameAndValueList =
    list(wsequence(PropertyName, ":", AssignmentExpression), ",");
var ObjectLiteral = 
    choice(wsequence("{", "}"),
	      wsequence("{", PropertyNameAndValueList, "}"));

var PrimaryExpression = 
    choice("this",
	      wsequence("(", Expression, ")"),
	      Identifier,
	      ArrayLiteral,
	      ObjectLiteral,
	      Literal);
var SourceElement = choice(Comment, Statement, FunctionDeclaration);
var Program = repeat0(SourceElement);
