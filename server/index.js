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
  fs = require( 'fs' ),
  express = require( 'express' ),
  dust = require( 'dustjs-linkedin' ),
  { getLiveDates } = require( '../lib/index' ),

  appPort = 1337,
  maxAge = 16 * 60 * 1000,
  cachedLiveDates = {},
  randomNames = [ 'David Bowie', 'Max von Sydow', 'Arnold Schwarzenegger', 'Lemmy Kilmister' ],

  app = express();

function getQueryName() {
  if ( process.argv.length > 2 ) {
    return process.argv.splice( 2 ).join( ' ' );
  }

  return cachedLiveDates[ '@lastQueried' ] || randomNames[ Math.round( Math.random() * randomNames.length ) ]; // eslint-disable-line id-match
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

      dust.render( 'default', { name, answer }, ( error, renderResult ) => {
        if ( error ) {
          res.send( JSON.stringify( error, null, '\t' ) );
        } else {
          res.send( renderResult );
        }
      } );
    } )
    .catch( ( reason ) => {
      console.log( `Something went wrong for ${ name }:`, reason );

      dust.render(
        'default',
        { name, answer: reason.message || reason },
        ( error, renderResult ) => {
          if ( error ) {
            res.send( JSON.stringify( error, null, '\t' ) );
          } else {
            res.send( renderResult );
          }
        }
      );
    } );
}

function loadTemplates() {
  const
    tplSrc = fs.readFileSync( './server/views/default.dust', 'utf8' ),
    tpl = dust.compile( tplSrc, 'default' );

  dust.loadSource( tpl );

  console.log( 'dust.templates loaded & precompiled' );
}

loadTemplates();

app.get( [ '/', '/random', '/last', '/latest' ], ( req, res ) => {
  renderOutput( res, getQueryName() );
} );

app.get( /(\/[\s\S]*?)/, ( req, res ) => {
  renderOutput( res, decodeURIComponent( req.url.replace( /^\//, '' ) ) );
} );

app.listen( appPort );

console.log( `express.app startet listening on port ${ appPort }` );
