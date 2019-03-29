/****************************/
/*    Custom Interpreter    */
/****************************/



let allVars = {};
let varDecl_RegExp = /^svar\s+([a-zA-Z_][\w_]*)$/, 
	varAssi_RegExp = /^([a-zA-Z_][\w_]*)\s*=\s*([^]+)$/, 
	print_RegExp = /^print\s+([^]+)$/;
let Str_replacer = "A!F!G!j@J#T~$E^q&X>:<",
	SepStr_RegExp = /["][^]+?["]|['][^]+?[']/g;
let AM_Op_RegExp = /[+-/*%]/g,
	SepSubExp_RE = /\(([^]+?)\)/g;


function Interpret( userCodes ) {
	SepStr_RegExp.lastIndex = -1
	userCodes = seperateLines( userCodes );
	for( let index = 1; index <= userCodes.length; index++ ) {
		let line = userCodes[ index - 1 ];
		if( varDecl_RegExp.test( line ) ) 
			allVars[ varDecl_RegExp.exec( line )[ 1 ] ] = undefined;
		else if( varAssi_RegExp.test( line ) && 
				allVars.hasOwnProperty( varAssi_RegExp.exec( line )[ 1 ] ) && 
				typeof evaluate( varAssi_RegExp.exec( line )[ 2 ] ) != 'object' )
			allVars[ varAssi_RegExp.exec( line )[ 1 ] ] = evaluate( varAssi_RegExp.exec( line )[ 2 ] );
		else if( print_RegExp.test( line ) && typeof evaluate( print_RegExp.exec( line )[ 1 ] ) != 'object' )
			console.log( evaluate( print_RegExp.exec( line )[ 1 ] ) );
		else
			alertError( userCodes, index );
	}
}

function seperateLines( anycodes ) {
	return anycodes.replace( SepStr_RegExp, Str_replacer ).split( ";" ).map(
			line => ( line.includes( Str_replacer ) ? line.replace( Str_replacer, SepStr_RegExp.exec( anycodes ) ) : line 
			).trim() ).filter( c => c.trim() != "" );
}

function evaluate( anyValue ) {
	if( anyValue != "" ) {
		let newValue = anyValue.replace( SepStr_RegExp, Str_replacer ).replace(
					SepSubExp_RE, ( _, subexp ) => evaluate( subexp ) ),
			tokens = newValue.split( AM_Op_RegExp ).map( t => t.trim() ),
			StoreStrs = anyValue.match( SepStr_RegExp ),
			StoreOps = newValue.match( AM_Op_RegExp );
		
		for( let i = 0; i <= tokens.length; i++ ) {
			if( i == tokens.length )
				return eval( tokens.map( t => {
					if( t == Str_replacer ) return StoreStrs.shift();
					else if( allVars.hasOwnProperty( t ) ) return allVars[ t ];
					else return t;
				} ).reduce( ( a, b ) => a = a + StoreOps.shift() + b) );
			
			if( ! ( allVars.hasOwnProperty( tokens[ i ] ) ||
				   tokens[ i ] == Str_replacer ||
				   ( ! isNaN( Number( tokens[ i ] ) ) ) ) )
				break;
		}
	}
	return { result: 'failed' };
}

function alertError( anyUserCodes, lineNo ) {
	let i = 1;
	throw `Error at line ${ lineNo }. \n\n${ anyUserCodes.map( line => `${ i++ }: ${ line }` ).join( "\n" ) }`;
}


/***********************************************************************************************************/


var userInput = prompt("Nano language Interpreter\n-----------------------------\nEnter code and execute.");

if( userInput != null && userInput.trim() != "" ) 
	try { Interpret( userInput ) }
	catch( error ) { console.log( error ) }