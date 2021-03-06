"use strict";


/**
 * Mesh.
 * (Original Java code by Henning Tjaden.)
 * @param {THREE.Geometry} data
 */
function HalfEdgeMesh( data ) {
	this.data = data;
	this.edges = [];
	this.vertices = [];
	this.borderEdges = [];

	this.buildMesh();
}


/**
 * Build the mesh.
 */
HalfEdgeMesh.prototype.buildMesh = function() {
	var faces = this.data.faces,
	    tempList = [];
	var borderEdge, faceArr, v;

	for( var i = 0; i < this.data.vertices.length; i++ ) {
		this.vertices[i] = new Vertex( i );
		tempList[i] = [];
	}

	for( var f = 0; f < this.data.faces.length; f++ ) {
		this.edges[f] = [];
	}

	for( var l = 0; l < faces.length; l++ ) {
		this.createEdges( faces[l], l );
		faceArr = [faces[l].a, faces[l].b, faces[l].c];

		for( var i = 0; i < 3; i++ ) {
			for( var j = 0; j < 3; j++ ) {
				if( faceArr[i] < faceArr[j] ) {
					tempList[faceArr[i]].push( [faceArr[j], l] );
				}
			}
		}
	}

	this.findAdjacency( tempList );
	this.setFirstEdges();

	for( var i = 0; i < tempList.length; i++ ) {
		for( var j = 0; j < tempList[i].length; j++ ) {
			v = tempList[i][j];

			if( v[0] >= 0 ) {
				borderEdge = [parseInt( i, 10 ), v[0]];
				this.borderEdges.push( borderEdge );
			}
		}
	}
};


/**
 * Connect edges.
 * @param {int} v1
 * @param {int} v2
 * @param {int} f1
 * @param {int} f2
 */
HalfEdgeMesh.prototype.connectEdges = function( v1, v2, f1, f2 ) {
	var p1 = null,
	    p2 = null;
	var e;

	for( var i = 0; i < this.edges[f1].length; i++ ) {
		e = this.edges[f1][i];

		if( Math.min( e.vertex.index, e.q.index ) == Math.min( v2, v1 )
		    && Math.max( e.vertex.index, e.q.index ) == Math.max( v2, v1 ) ) {
			p1 = e;
		}
	}

	for( var i = 0; i < this.edges[f2].length; i++ ) {
		e = this.edges[f2][i];

		if( Math.min( e.vertex.index, e.q.index ) == Math.min( v2, v1 )
		    && Math.max( e.vertex.index, e.q.index ) == Math.max( v2, v1 ) ) {
			p2 = e;
		}
	}

	p1.pair = p2;
	p2.pair = p1;
};


/**
 * Create edges.
 * @param {THREE.Face3} face
 * @param {int}         faceIndex
 */
HalfEdgeMesh.prototype.createEdges = function( face, faceIndex ) {
	var faceArr = [face.a, face.b, face.c];
	var current, firstEdge, ix, previous;

	firstEdge = new Edge( this.vertices[face.b], this.vertices[face.a], faceIndex );
	previous = firstEdge;

	this.vertices[face.a].edges.push( firstEdge );

	for( var i = 1; i < 3; i++ ) {
		ix = ( i + 1 ) % 3;
		current = new Edge( this.vertices[faceArr[ix]], this.vertices[faceArr[i]], faceIndex );

		this.vertices[faceArr[i]].edges.push( current );
		previous.next = current;
		this.edges[faceIndex].push( previous );
		previous = current;
	}

	previous.next = firstEdge;
	this.edges[faceIndex].push( previous );
};


/**
 * Find adjacency.
 * @param {Dictionary} tempList
 */
HalfEdgeMesh.prototype.findAdjacency = function( tempList ) {
	var v1, v2;

	for( var i = 0; i < tempList.length; i++ ) {
		for( var j = 0; j < tempList[i].length; j++ ) {
			v1 = tempList[i][j];

			for( var k = 0; k < tempList[i].length; k++ ) {
				v2 = tempList[i][k];

				if( v1[0] > 0 && v2[0] > 0 && v1[0] == v2[0] && v1[1] != v2[1] ) {
					this.connectEdges( i, v1[0], v1[1], v2[1] );
					v1[0] = -1;
					v2[0] = -1;
				}
			}
		}
	}
};


/**
 * Set first edges.
 */
HalfEdgeMesh.prototype.setFirstEdges = function() {
	for( var i = 0; i < this.vertices.length; i++ ) {
		this.vertices[i].setUpFirstEdge();
	}
};
