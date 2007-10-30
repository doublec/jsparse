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
load("jsparse.js");
load("es3.js");
load("tests.js");

function WhitespaceTest() {
    assertTrue("Whitespace failed to parse space", Whitespace(ps(" ")));
    assertTrue("Whitespace failed to parse tab", Whitespace(ps("\t")));
    assertFalse("Whitespace parsed non-space", Whitespace(ps("abcd")));
}

function LineTerminatorTest() {
    assertTrue("LineTerminator failed to parse carriage return", LineTerminator(ps("\n")));
    assertTrue("LineTerminator failed to parse newline", LineTerminator(ps("\n")));
    assertFalse("LineTerminator parsed incorrect data", LineTerminator(ps("abcd")));
}
    
function SingleLineCommentTest() {
    assertTrue("SingleLineComment failed to parse comment with no space", SingleLineComment(ps("//foo\n")));
    assertTrue("SingleLineComment failed to parse comment with space", SingleLineComment(ps("// foo\n")));
}

function CommentTest() {
    assertFullyParsed("Comment", "// foo\r");
    assertFullyParsed("Comment", "//foo\n");
    assertFullyParsed("Comment", "/* foo */");
    assertFullyParsed("Comment", "/* /* foo */ */");
    assertFullyParsed("Comment", "/* foo \n * bar  */");
}

function NullLiteralTest() {
    assertTrue("NullLiterator failed to parse null", NullLiteral(ps("null")));
    assertFalse("NullLiterator parsed invalid data", NullLiteral(ps("xnull")));
}

function DecimalDigitTest() {
    assertEqual("DecimalDigit failed to parse 0", DecimalDigit(ps("0")).ast, 0);
    assertEqual("DecimalDigit failed to parse 1", DecimalDigit(ps("1")).ast, 1);
    assertEqual("DecimalDigit failed to parse 2", DecimalDigit(ps("2")).ast, 2);
    assertEqual("DecimalDigit failed to parse 3", DecimalDigit(ps("3")).ast, 3);
    assertEqual("DecimalDigit failed to parse 4", DecimalDigit(ps("4")).ast, 4);
    assertEqual("DecimalDigit failed to parse 5", DecimalDigit(ps("5")).ast, 5);
    assertEqual("DecimalDigit failed to parse 6", DecimalDigit(ps("6")).ast, 6);
    assertEqual("DecimalDigit failed to parse 7", DecimalDigit(ps("7")).ast, 7);
    assertEqual("DecimalDigit failed to parse 8", DecimalDigit(ps("8")).ast, 8);
    assertEqual("DecimalDigit failed to parse 9", DecimalDigit(ps("9")).ast, 9);
    assertFalse("DecimalDigit parsed invalid data", DecimalDigit(ps("a")));
}

function NonZeroDigitTest() {
    assertEqual("NonZeroDigit failed to parse 1", NonZeroDigit(ps("1")).ast, 1);
    assertEqual("NonZeroDigit failed to parse 2", NonZeroDigit(ps("2")).ast, 2);
    assertEqual("NonZeroDigit failed to parse 3", NonZeroDigit(ps("3")).ast, 3);
    assertEqual("NonZeroDigit failed to parse 4", NonZeroDigit(ps("4")).ast, 4);
    assertEqual("NonZeroDigit failed to parse 5", NonZeroDigit(ps("5")).ast, 5);
    assertEqual("NonZeroDigit failed to parse 6", NonZeroDigit(ps("6")).ast, 6);
    assertEqual("NonZeroDigit failed to parse 7", NonZeroDigit(ps("7")).ast, 7);
    assertEqual("NonZeroDigit failed to parse 8", NonZeroDigit(ps("8")).ast, 8);
    assertEqual("NonZeroDigit failed to parse 9", NonZeroDigit(ps("9")).ast, 9);
    assertFalse("NonZeroDigit parsed zero", NonZeroDigit(ps("0")));
    assertFalse("NonZeroDigit parsed invalid data", NonZeroDigit(ps("a")));
}

function IdentifierTest() {
    assertFullyParsed("Identifier", "abcd");
    assertFalse("Identifier('while')", Identifier(ps('while')));
    assertTrue("Identifier('abcd').ast=='abcd'", Identifier(ps('abcd')).ast=='abcd'); 
}

function DecimalDigitsTest() {
    assertEqual("DecimalDigits failed to parse 123", DecimalDigits(ps("123")).ast.toString(), "1,2,3");
}

function AssignmentExpressionTest() {
    assertFullyParsed("AssignmentExpression", "a=1");
    assertFullyParsed("AssignmentExpression", "a=b");
    assertFullyParsed("AssignmentExpression", "a");
    assertFullyParsed("AssignmentExpression", "12");
}

function ExpressionTest() {
    assertFullyParsed("Expression", "1");
    assertFullyParsed("Expression", "'ddf'");
    assertFullyParsed("Expression", "\"ddf\"");
    assertFullyParsed("Expression", "foo");
    assertFullyParsed("Expression", "foo.bar");
}

function VariableDeclarationTest() {
    assertFullyParsed("VariableDeclaration", "a");
    assertFullyParsed("VariableDeclaration", "a=1");
}

function VariableStatementTest() {
    assertFullyParsed("VariableStatement", "var a");
    assertFullyParsed("VariableStatement", "var a,b");
    assertFullyParsed("VariableStatement", "var a=1");
    assertFullyParsed("VariableStatement", "var a = 1, b = 2,c=3");
}

function IfStatementTest() {
    assertFullyParsed("IfStatement", "if(a) { }");
    assertFullyParsed("IfStatement", "if(a) { var a=2; var b=3; print('foo') }");
}

function ArrayLiteralTest() {
    assertFullyParsed("ArrayLiteral", "[]");
    assertFullyParsed("ArrayLiteral", "[ ]");
    assertFullyParsed("ArrayLiteral", "[ 1,2,3 ]");
    assertFullyParsed("ArrayLiteral", "[ 1,,3 ]");
    assertFullyParsed("ArrayLiteral", "[ 'hello' ]");
    assertFullyParsed("ArrayLiteral", "[ 1,[2,3],4 ]");
}

function ObjectLiteralTest() {
    assertFullyParsed("ObjectLiteral", "{}");
    assertFullyParsed("ObjectLiteral", "{ }");
    assertFullyParsed("ObjectLiteral", "{ one: 1 }");
    assertFullyParsed("ObjectLiteral", "{ one: 1, two: 'two' }");
    assertFullyParsed("ObjectLiteral", "{ one: 1, two: {three:3}, four:4 }");
}

function IterationTest() {
    assertFullyParsed("IterationStatement", "for(;;) ;");
    assertFullyParsed("IterationStatement", "for(;;) { }");
    assertFullyParsed("IterationStatement", "for(i=0;i<5;++i) ;");
    assertFullyParsed("IterationStatement", "for(i=0;i<5;++i) {}");
    assertFullyParsed("IterationStatement", "for(var i=0;i<5;++i) ;");
    assertFullyParsed("IterationStatement", "for(i=0;i<foo.length;++i) ;");
}

function FunctionDeclarationTest() {
    assertFullyParsed("FunctionBody", "{ }");
    assertFullyParsed("FunctionBody", "{ return; }");
    assertFullyParsed("FormalParameterList", "a,b");
    assertFullyParsed("FormalParameterList", "a ,b");
    assertFullyParsed("FormalParameterList", "a , b");
    assertFullyParsed("FormalParameterList", "a, b");
    assertFullyParsed("FunctionDeclaration", "function identity() { }");
    assertFullyParsed("FunctionDeclaration", "function identity(a) { }");
    assertFullyParsed("FunctionDeclaration", "function identity(a) { return a; }");
    assertFullyParsed("FunctionDeclaration", "function identity() { return ;}");
    assertFullyParsed("FunctionDeclaration", "function identity(b) { var a=12; return a+b; }");
    assertFullyParsed("FunctionBody", "return;");
    assertFullyParsed("FunctionBody", "return 123;");
    assertFullyParsed("FunctionBody", "return function() { };");
}
    
function allTests() {
    WhitespaceTest();
    LineTerminatorTest();
    SingleLineCommentTest();
    CommentTest();
    NullLiteralTest();
    DecimalDigitTest();
    NonZeroDigitTest();
    DecimalDigitsTest();
    IdentifierTest();
    VariableStatementTest();
    VariableDeclarationTest();
    AssignmentExpressionTest();
    ExpressionTest();
    IfStatementTest();
    ArrayLiteralTest();
    ObjectLiteralTest();
    IterationTest();
    FunctionDeclarationTest();
}

time(function() { runTests(allTests); });