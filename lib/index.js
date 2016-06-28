/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * @ta2edchimp wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Poul-Henning Kamp
 * ----------------------------------------------------------------------------
 */
/* global Promise */
'use strict';

const
  fetch = require( 'node-fetch' );

module.exports = {
  getLiveDates
};

function getLiveDates( name ) {
  return new Promise( ( resolve, reject ) => {
    fetch(
      'https://en.wikipedia.org/w/api.php?' + [
        'action=query',
        'format=json',
        'prop=revisions',
        'titles=' + encodeURIComponent( name ),
        'rvprop=content',
        'rvlimit=1'
      ].join( '&' ) )
      .then( ( res ) => {
        if ( res.ok ) {
          return res.json();
        }

        throw Error( '¯\\_(ツ)_/¯' );
      } )
      .then( ( json ) => {
        if ( !json.query || !json.query.pages ) {
          throw Error( '¯\\_(ツ)_/¯' );
        }

        const
          allPageIds = Object.keys( json.query.pages ),
          pageId = allPageIds.length > 0 ? allPageIds[ 0 ] : 0;

        if ( !pageId ) {
          throw Error( '¯\\_(ツ)_/¯' );
        }

        return json.query.pages[ pageId ].revisions;
      } )
      .then( ( revisions ) => {
        const
          currentRev = revisions && revisions.length > 0 ? revisions[ 0 ] : null,
          content = currentRev && '*' in currentRev ? currentRev[ '*' ] : '';

        if ( !content ) {
          throw Error( '¯\\_(ツ)_/¯' );
        }

        return content;
      } )
      .then( ( content ) => {
        const
          birth = /\{\{birth date(?:[^|]{0,}\|){1,}?([0-9]{4})\|([0-9]{1,2})\|([0-9]{1,2})/i.exec( content ),
          birthDate = transformDateMatch( birth ),
          death = /\{\{death date(?:[^|]{0,}\|){1,}?([0-9]{4})\|([0-9]{1,2})\|([0-9]{1,2})/i.exec( content ),
          deathDate = transformDateMatch( death );

        resolve( {
          name,
          born: !!birth,
          birthDate,
          died: !!death,
          deathDate
        } );
      } )
      .catch( ( reason ) => {
        reject( reason );
      } );
  } );
}

function transformDateMatch( date ) {
  return date ? new Date( parseInt( date[ 1 ], 10 ), parseInt( date[ 2 ], 10 ) - 1, parseInt( date[ 3 ], 10 ) ) : null;
}
