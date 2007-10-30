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

var passed = [];
var failed = [];
function assertTrue(msg, test) {
    if(test)
	passed.push(msg);
    else
	failed.push(msg);
}

function assertTrue2(test) {
    if(eval(test))
	passed.push(test);
    else
	failed.push(test);
}

function assertFalse(msg, test) {
    if(test)
	failed.push(msg);
    else
	passed.push(msg);
}

function assertEqual(msg, value1, value2) {
    if(value1 == value2) 
	passed.push(msg);
    else
	failed.push(msg);
}

function assertNotEqual(msg, value1, value2) {
    if(value1 != value2) 
	passed.push(msg);
    else
	failed.push(msg);
}

function assertFullyParsed(parser, string) {
    var msg = parser + " did not fully parse: " + string;
    try {
	var result = eval(parser)(ps(string));
	if(result && result.remaining.length == 0) 
	    passed.push(msg);
	else
	    failed.push(msg);
    }
    catch(e) {
	failed.push(msg);
    }
}

function assertParseFailed(parser, string) {
    var msg = parser + " succeeded but should have failed: " + string;
    try {
	var result = eval(parser)(ps(string));
	if(!result) 
	    passed.push(msg);
	else
	    failed.push(msg);
    }
    catch(e) {
	failed.push(msg);
    }
}

function assertParseMatched(parser, string, expected) {
    var msg = parser + " parse did not match: " + string;
    try {
	var result = eval(parser)(ps(string));
	if(result && result.matched == expected) 
	    passed.push(msg);
	else
	    failed.push(msg + " got [" + result.matched + "] expected [" + expected + "]");
    }
    catch(e) {
	failed.push(msg);
    }
}

function time(func) {
    var start = java.lang.System.currentTimeMillis();
    var r =  func();
    var end = java.lang.System.currentTimeMillis();
    print("Time: " + (end-start) + "ms");
    return r;
}

function runTests(func) {
    passed = [];
    failed = [];
    func();
    var total = passed.length + failed.length;
    for(var i=0; i < failed.length; ++i) 
	print(failed[i]);
    print(total + " tests: " + passed.length + " passed, " + failed.length + " failed");
}

function ParserTests() {
    // Token
    assertFullyParsed("token('a')", "a");
    assertFullyParsed("token('abcd')", "abcd");
    assertParseMatched("token('abcd')", "abcdef", "abcd");
    assertParseFailed("token('a')", "b");

    // ch
    assertParseMatched("ch('a')", "abcd", "a");
    assertParseFailed("ch('a')", "bcd");

    // range
    for(var i=0; i < 10; ++i) {
	assertParseMatched("range('0','9')", "" + i, i);
    }
    assertParseFailed("range('0','9')", "a");

    // whitespace
    assertFullyParsed("whitespace(token('ab'))", "ab");
    assertFullyParsed("whitespace(token('ab'))", " ab");
    assertFullyParsed("whitespace(token('ab'))", "  ab");
    assertFullyParsed("whitespace(token('ab'))", "   ab");

    // negate
    assertFullyParsed("negate(ch('a'))", "b");
    assertParseFailed("negate(ch('a'))", "a");

    // end_p
    assertParseFailed("end_p", "ab");
    assertFullyParsed("end_p", "");

    // nothing_p
    assertParseFailed("nothing_p", "abcd");
    assertParseFailed("nothing_p", "");

    // sequence
    assertFullyParsed("sequence('a', 'b')", "ab");
    assertParseFailed("sequence('a', 'b')", "b");
    assertParseFailed("sequence('a', 'b')", "a");
    assertParseMatched("sequence('a', whitespace('b'))", "a b", "ab");
    assertParseMatched("sequence('a', whitespace('b'))", "a  b", "ab");
    assertParseMatched("sequence('a', whitespace('b'))", "ab", "ab");

    // choice
    assertFullyParsed("choice('a', 'b')", "a");
    assertFullyParsed("choice('a', 'b')", "b");
    assertParseMatched("choice('a', 'b')", "ab", "a");
    assertParseMatched("choice('a', 'b')", "bc", "b");

    // repeat0
    assertParseMatched("repeat0(choice('a','b'))", "adef", "a");
    assertParseMatched("repeat0(choice('a','b'))", "bdef", "b");
    assertParseMatched("repeat0(choice('a','b'))", "aabbabadef", "aabbaba");
    assertParseMatched("repeat0(choice('a','b'))", "daabbabadef", "");

    // repeat1
    assertParseMatched("repeat1(choice('a','b'))", "adef", "a");
    assertParseMatched("repeat1(choice('a','b'))", "bdef", "b");
    assertParseMatched("repeat1(choice('a','b'))", "aabbabadef", "aabbaba");
    assertParseFailed("repeat1(choice('a','b'))", "daabbabadef");

    // optional
    assertParseMatched("sequence('a', optional(choice('b','c')), 'd')", "abd", "abd");
    assertParseMatched("sequence('a', optional(choice('b','c')), 'd')", "acd", "acd");
    assertParseMatched("sequence('a', optional(choice('b','c')), 'd')", "ad", "ad");
    assertParseFailed("sequence('a', optional(choice('b','c')), 'd')", "aed");
    assertParseFailed("sequence('a', optional(choice('b','c')), 'd')", "ab");
    assertParseFailed("sequence('a', optional(choice('b','c')), 'd')", "ac");

    // list
    assertParseMatched("list(choice('1','2','3'),',')", "1,2,3", "1,2,3");
    assertParseMatched("list(choice('1','2','3'),',')", "1,3,2", "1,3,2");
    assertParseMatched("list(choice('1','2','3'),',')", "1,3", "1,3");
    assertParseMatched("list(choice('1','2','3'),',')", "3", "3");
    assertParseFailed("list(choice('1','2','3'),',')", "5,6,7");

    // and
    assertParseMatched("sequence(and('0'), '0')", "0", "0");
    assertParseFailed("sequence(and('0'), '1')", "0");
    assertParseMatched("sequence('1',and('2'))", "12", "1");

    // not
    assertParseMatched("sequence('a',choice('+','++'),'b')", "a+b", "a+b");
    assertParseFailed("sequence('a',choice('+','++'),'b')", "a++b");
    assertParseMatched("sequence('a',choice(sequence('+',not('+')),'++'),'b')", "a+b", "a+b");
    assertParseMatched("sequence('a',choice(sequence('+',not('+')),'++'),'b')", "a++b", "a++b");        
}


time(function() { runTests(ParserTests); });
