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
var zero = action("0", function(ast) { return 0; });
var decimal_digit = action(range("0", "9"), function(ast) { return parseInt(ast); });
var non_zero_digit = action(range("1", "9"), function(ast) { return parseInt(ast); });
var decimal_digits = repeat1(decimal_digit); 
var decimal_integer_literal = alternate(zero, sequence(non_zero_digit, optional(decimal_digits)));
var signed_integer = alternate(decimal_digits, sequence("+", decimal_digits), sequence("-", decimal_digits));
var exponent_indicator = alternate("e", "E");
var exponent_part = sequence(exponent_indicator, signed_integer);
var decimal_literal = alternate(sequence(decimal_integer_literal, ".", optional(decimal_digits), optional(exponent_part)),
				sequence(".", decimal_digits, optional(exponent_part)),
				sequence(decimal_integer_literal, optional(exponent_part)));

var hex_digit = alternate(range("0", "9"), range("a", "f"), range("A", "F"));
var hex_integer_literal = sequence(alternate("0x", "0X"), repeat1(hex_digit));

var numeric_literal = alternate(hex_integer_literal, decimal_literal);

var single_escape_character = alternate("'", "\"", "\\", "b", "f", "n", "r", "t", "v");
var non_escape_character = negate(single_escape_character);
var character_escape_sequence = alternate(single_escape_character, non_escape_character);
var hex_escape_sequence = sequence("x", hex_digit, hex_digit);
var unicode_escape_sequence = sequence("u", hex_digit, hex_digit, hex_digit, hex_digit);
var escape_sequence = alternate(hex_escape_sequence, unicode_escape_sequence, character_escape_sequence);
var single_string_character = alternate(negate(alternate("\'", "\\", "\r", "\n")),
					sequence("\\", escape_sequence));
var double_string_character = alternate(negate(alternate("\"", "\\", "\r", "\n")),
					sequence("\\", escape_sequence));
var single_string_characters = repeat1(single_string_character);
var double_string_characters = repeat1(double_string_character);
var string_literal = alternate(sequence("\"", optional(double_string_characters), "\""),
			       sequence("'", optional(single_string_characters), "'"));
			       
var null_literal = token("null");
var boolean_literal = alternate("true", "false");

var literal = alternate(null_literal, boolean_literal, numeric_literal, string_literal);					       
