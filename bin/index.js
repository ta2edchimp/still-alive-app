#!/usr/bin/env node
/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * @ta2edchimp wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Poul-Henning Kamp
 * ----------------------------------------------------------------------------
 */
/* eslint no-console: 0 */

'use strict';

const
  { getLiveDates } = require( '../lib/index' ),
  randomNames = [ 'David Bowie', 'Max von Sydow', 'Arnold Schwarzenegger', 'Lemmy Kilmister' ],
  queryName = getQueryName();

function getQueryName() {
  if ( process.argv.length > 2 ) {
    return process.argv.splice( 2 ).join( ' ' );
  }

  return randomNames[ Math.round( Math.random() * randomNames.length ) ]; // eslint-disable-line id-match
}

getLiveDates( queryName )
  .then( ( result ) => {
    console.log( '\n\t' + queryName + ':\n' );
    console.log( '\tBirth ..:  ' + ( result.born ? result.birthDate.toString() : 'unborn' ) );
    console.log( '\tDeath ..:  ' + ( result.died ? result.deathDate.toString() : 'still living' ) + '\n' );
    console.log( '\nIs ' + result.name + ' still living? ' + ( !result.died ? 'Yes!' : 'No.' ) + '\n' );
  } )
  .catch( ( reason ) => {
    console.log( '\nIs ' + queryName + ' still living? ' + ( reason.message || reason ) + '\n' );
  } );
