/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * @ta2edchimp wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Poul-Henning Kamp
 * ----------------------------------------------------------------------------
 */
/* global Promise */
/* eslint no-console: 0 */

'use strict';


const
  express = require( 'express' ),
  { getLiveDates } = require( '../lib/index' ),
  { getDefaultView } = require( './views/index' ),

  appPort = 1337,
  maxAge = 16 * 60 * 1000,
  cachedLiveDates = {},
  randomStartupNames = [ 'David Bowie', 'Max von Sydow', 'Arnold Schwarzenegger', 'Lemmy' ],

  app = express();

function getQueryName() {
  if ( process.argv.length > 2 ) {
    return process.argv.splice( 2 ).join( ' ' );
  }

  const
    allNames = Object.keys( cachedLiveDates ).filter( ( name ) => name !== '@lastQueried' ),
    randomName = allNames.length > 0 ? allNames[ Math.round( Math.random() * ( allNames.length - 1 ) ) ] : '';

  return randomName || randomStartupNames[ Math.round( Math.random() * ( randomStartupNames.length - 1 ) ) ]; // eslint-disable-line id-match
}

function proxyGetLiveDates( name ) {
  const
    now = Date.now(),
    cachedResult = cachedLiveDates[ name ];

  if ( cachedResult && cachedResult.timestamp > ( now - maxAge ) ) {
    return new Promise( ( resolve ) => {
      cachedLiveDates[ '@lastQueried' ] = name;
      console.log( `Look ma: no network request for ${ name }! (came from cache)` );
      resolve( cachedResult );
    } );
  }

  return getLiveDates( name )
    .then( ( result ) => {
      result.timestamp = Date.now();
      cachedLiveDates[ name ] = result;
      cachedLiveDates[ '@lastQueried' ] = name;

      return cachedLiveDates[ name ];
    } );
}

function renderOutput( res, name ) {
  proxyGetLiveDates( name )
    .then( ( result ) => {
      let answer = '¯\\_(ツ)_/¯';

      if ( result.born ) {
        answer = !result.died ? 'Yes :)' : 'No :(';
      }

      console.log( `Is ${ name } still alive? ${ answer }` );

      res.send( getDefaultView( { name, answer } ) );
    } )
    .catch( ( reason ) => {
      console.log( `Something went wrong for ${ name }:`, reason );

      res.send( getDefaultView( { name, answer: reason.message || reason } ) );
    } );
}

app.get( [ '/', '/random', '/last', '/latest', '/favicon.ico' ], ( req, res ) => {
  renderOutput( res, getQueryName() );
} );

app.get( /(\/[\s\S]*?)/, ( req, res ) => {
  const name = req.url.replace( /^\//, '' ).replace( /\+/ig, ' ' );

  renderOutput( res, decodeURIComponent( name ) );
} );

app.listen( appPort );

console.log( `express.app startet listening on port ${ appPort }` );
