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
// Evaluates as it parses the sample grammar
//
// From http://en.wikipedia.org/wiki/Parsing_expression_grammar
//
// Value   := [0-9]+ / '(' Expr ')'
// Product := Value (('*' / '/') Value)*
// Sum     := Product (('+' / '-') Product)*
// Expr    := Sum 
//
// Forward definitions required due to lack of laziness in JS 
var Expr = function(state) { return Expr(state); }

var Number = 
    action(repeat1(range('0','9')), 
	   function(ast) {
	       return parseInt(ast.join(""));
	   });
var Value = choice(Number, Expr);

function operator_action(p, func) 
{
    return action(p, function(ast) { return func; });
}

var Times = operator_action('*', function(lhs,rhs) { return lhs*rhs; });
var Divides = operator_action('/', function(lhs,rhs) { return lhs/rhs; });
var Plus = operator_action('+', function(lhs,rhs) { return lhs+rhs; });
var Minus = operator_action('-', function(lhs,rhs) { return lhs-rhs; });

var Product = chainl(Value, choice(Times, Divides));
var Sum = chainl(Product, choice(Plus, Minus));
var Expr = Sum;

// Usage: Expr(ps("1+2*3-4"))