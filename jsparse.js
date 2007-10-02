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
function identity(x) {
	return x;
}

function foldl(f, initial, seq) {
	for(var i=0; i< seq.length; ++i) 
		initial = f(initial, seq[i]);
	return initial;
}

// 'r' is the remaining string to be parsed.
// 'matched' is the portion of the string that
// was successfully matched by the parser.
// 'ast' is the AST returned by the successfull parse.
function make_result(r, matched, ast) {
	return { remaining: r, matched: matched, ast: ast };
}
		
// 'token' is a parser combinator that given a string, returns a parser
// that parses that string value. The AST contains the string that was parsed.
function token(s) {
	return function(input) {
		var r = input.length >= s.length && input.substring(0,s.length) == s;
		if(r) 
			return { remaining: input.substring(s.length), matched: s, ast: s };
		else
			return false;
	}
}

// Like 'token' but for a single character. Returns a parser that given a string
// containing a single character, parses that character value.
function ch(c) {
	return function(input) {
		var r = input.length >= 1 && input[0] == c;
		if(r) 
			return { remaining: input.substring(1), matched: c, ast: c };
		else
			return false;
	}
}

// 'range' is a parser combinator that returns a single character parser
// (similar to 'ch'). It parses single characters that are in the inclusive
// range of the 'lower' and 'upper' bounds ("a" to "z" for example).
function range(lower, upper) {
	return function(input) {
		var r = input.length >= 1 && input[0] >= lower && input[0] <= upper;
		if(r) 
			return { remaining: input.substring(1), matched: input[0], ast: input[0] };
		else
			return false;
	}
}

// Helper function to convert string literals to token parsers
// and perform other implicit parser conversions.
function toParser(p) {
	return (typeof(p) == "string") ? token(p) : p;
}

// Parser combinator that passes the AST generated from the parser 'p' 
// to the function 'f'. The result of 'f' is used as the AST in the result.
function action(p, f) {
	var p = toParser(p);
	return function(input) {
		var x = p(input);
		if(x) {
			x.ast = f(x.ast);
			return x;
		}
		return false;
	}
}

// 'negate' will negate a single character parser. So given 'ch("a")' it will successfully
// parse any character except for 'a'. Or 'negate(range("a", "z"))' will successfully parse
// anything except the lowercase characters a-z.
function negate(p) {
	var p = toParser(p);
	return function(input) {
		if(input.length >= 1) {
			var r = p(input);
			if(!r) 
				return make_result(input.substring(1), input[0], input[0]);
		}
		return false;
	}
}

// 'end_p' is a parser that is successfull if the input string is empty (ie. end of parse).
function end_p(input) {
	if(input.length == 0) 
		return make_result("", undefined, undefined);
	else
		return false;
}

// 'nothing_p' is a parser that always fails.
function nothing_p(input) {
	return false;
}

// 'sequence' is a parser combinator that processes a number of parsers in sequence.
// It can take any number of arguments, each one being a parser. The parser that 'sequence'
// returns succeeds if all the parsers in the sequence succeeds. It fails if any of them fail.
function sequence() {
	var parsers = arguments;
	return function(input) {
		var ast = [];
		var matched = "";
		for(var i=0; i< parsers.length; ++i) {
			var parser = toParser(parsers[i]);	
			var result = parser(input);
			if(result) {
				input = result.remaining;
				if(result.ast != undefined) {
					ast.push(result.ast);
					matched = matched + result.matched;
				}
			}
			else {
				return false;
			}
		}
		return make_result(input, matched, ast);
	}
}

// 'alternate' is a parser combinator that provides a choice between other parsers.
// It takes any number of parsers as arguments and returns a parser that will try
// each of the given parsers in order. The first one that succeeds results in a 
// successfull parse. It fails if all parsers fail.
function alternate() {
	var parsers = arguments;
	return function(input) {
		for(var i=0; i< parsers.length; ++i) {
			var parser=toParser(parsers[i]);
			var result = parser(input);
			if(result) {
				return result;
			}
		}		
		return false;
	}
}

// 'difference' is a parser combinator that takes two parsers, 'p1' and 'p2'. 
// It returns a parser that succeeds if 'p1' matches and 'p2' does not. If
// both match then if p2's matched text is shorter than p1's it is successfull.
function difference(p1,p2) {
	var p1 = toParser(p1);
	var p2 = toParser(p2);

	// match a but not b. if both match and b's matched text is shorter
        // than a's, a successfull match is made
	return function(input) {
		var br = p2(input);
		if(!br) {
			return p1(input);
		} else {
			var ar = p1(input);
			if(ar.matched.length >= br.matched.length)
				return br;
			else
				return ar;
		}
	}
}


// 'xor' is a parser combinator that takes two parsers, 'p1' and 'p2'. 
// It returns a parser that succeeds if 'p1' or 'p2' match but fails if
// they both match.
function xor(p1, p2) {
	var p1 = toParser(p1);
	var p2 = toParser(p2);

	// match a or b but not both
	return function(input) {
		var ar = p1(input);
		var br = p2(input);
		if(ar && br)
			return false;
		else
			return ar || br;
	}
}

// A parser combinator that takes one parser. It returns a parser that
// looks for zero or more matches of the original parser.
function repeat0(p) {
	var p = toParser(p);

	return function(input) {
		var ast = [];
		var matched = "";
		var result;
		while(result = p(input)) {
			ast.push(result.ast);
			matched = matched + result.matched;
			input = result.remaining;			
		}		
		return make_result(input, matched, ast);		
	}
}

// A parser combinator that takes one parser. It returns a parser that
// looks for one or more matches of the original parser.
function repeat1(p) {
	var p = toParser(p);

	return function(input) {
		var ast = [];
		var matched = "";
		var result= p(input);
		if(!result) 
			return false;

		while(result) {
			ast.push(result.ast);
			matched = matched + result.matched;
			input = result.remaining;			
			result = p(input);
		}		
		return make_result(input, matched, ast);		
	}
}

// A parser combinator that takes one parser. It returns a parser that
// matches zero or one matches of the original parser.
function optional(p) {
	var p = toParser(p);

	return function(input) {
		var r = p(input);
		return r || make_result(input, "", false);				
	}
}

// A parser combinator that ensures that the given parser succeeds but
// ignores its result
function expect(p) {
	return action(p, function(ast) { return undefined; });
}

function chain(p, s, f) {
	var p = toParser(p);

	return action(sequence(p, repeat0(action(sequence(s, p), f))),
                      function(ast) { return [ast[0]].concat(ast[1]); });
}

// A parser combinator to do left chaining and evaluation. Like 'chain', it expects a parser
// for an item and for a seperator. The seperator parser's AST result should be a function
// of the form: function(lhs,rhs) { return x; }
// Where 'x' is the result of applying some operation to the lhs and rhs AST's from the item
// parser.
function chainl(p, s) {
	var p = toParser(p);
	return action(sequence(p, repeat0(sequence(s, p))),
	              function(ast) {
			return foldl(function(v, action) { return action[0](v, action[1]); }, ast[0], ast[1]);
                      });
}

// A parser combinator that returns a parser that matches lists of things. The parser to 
// match the list item and the parser to match the seperator need to 
// be provided. The AST is the array of matched items.
function list(p, s) {
	return chain(p, s, function(ast) { return ast[1]; });
}

// A parser that always returns a zero length match
function epsilon_p(input) {
	return make_result(input, "", undefined);
}

// Allows attaching of a function anywhere in the grammer. If the function returns
// true then parse succeeds otherwise it fails. Can be used for testing if a symbol
// is in the symbol table, etc.
function semantic(f) {
	return function(input) {
		return f() ? make_result(input, "", undefined) : false;
	}
}

// Similar to semantic, a syntactic predicate asserts that a certain conditional
// syntax is satisfied before evaluating another production. Eg:
// sequence(syntactic("0"), oct_p)
// (if a leading zero, then parse octal)
function syntactic(p) {
	var p = toParser(p);
	return function(input) {
		return p(input) ? make_result(input, "", undefined) : false;
	}
}
			

