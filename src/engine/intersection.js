
export default class Intersection {

    /**
     * !#en Test line and line
     * !#zh 测试线段与线段是否相交
     * @method lineLine
     * @param {Vec2} a1 - The start point of the first line
     * @param {Vec2} a2 - The end point of the first line
     * @param {Vec2} b1 - The start point of the second line
     * @param {Vec2} b2 - The end point of the second line
     * @return {boolean}
     */
    static lineLine ( a1, a2, b1, b2 ) {

        let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        let u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if ( u_b !== 0 ) {
            let ua = ua_t / u_b;
            let ub = ub_t / u_b;

            if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
                return true;
            }
        }

        return false;
    }

    /**
     * !#en Test line and rect
     * !#zh 测试线段与矩形是否相交
     * @method lineRect
     * @param {Vec2} a1 - The start point of the line
     * @param {Vec2} a2 - The end point of the line
     * @param {Rect} b - The rect
     * @return {boolean}
     */
    static lineRect ( a1, a2, b ) {
        var r0 = { x: b.x, y: b.y };
        var r1 = { x: b.x, y: b.yMax };
        var r2 = { x: b.xMax, y: b.yMax };
        var r3 = { x: b.xMax, y: b.y };
    
        if ( Intersection.lineLine( a1, a2, r0, r1 ) )
            return true;
    
        if ( Intersection.lineLine( a1, a2, r1, r2 ) )
            return true;
    
        if ( Intersection.lineLine( a1, a2, r2, r3 ) )
            return true;
    
        if ( Intersection.lineLine( a1, a2, r3, r0 ) )
            return true;
    
        return false;
    }

    /**
     * !#en Test line and polygon
     * !#zh 测试线段与多边形是否相交
     * @method linePolygon
     * @param {Vec2} a1 - The start point of the line
     * @param {Vec2} a2 - The end point of the line
     * @param {Vec2[]} b - The polygon, a set of points
     * @return {boolean}
     */
    static linePolygon ( a1, a2, b ) {
        var length = b.length;
    
        for ( var i = 0; i < length; ++i ) {
            var b1 = b[i];
            var b2 = b[(i+1)%length];
    
            if ( Intersection.lineLine( a1, a2, b1, b2 ) )
                return true;
        }
    
        return false;
    }

    /**
     * !#en Test rect and rect
     * !#zh 测试矩形与矩形是否相交
     * @method rectRect
     * @param {Rect} a - The first rect
     * @param {Rect} b - The second rect
     * @return {boolean}
     */
    static rectRect ( a, b ) {
        // jshint camelcase:false

        var a_min_x = a.x;
        var a_min_y = a.y;
        var a_max_x = a.x + a.width;
        var a_max_y = a.y + a.height;

        var b_min_x = b.x;
        var b_min_y = b.y;
        var b_max_x = b.x + b.width;
        var b_max_y = b.y + b.height;

        return a_min_x <= b_max_x &&
            a_max_x >= b_min_x &&
            a_min_y <= b_max_y &&
            a_max_y >= b_min_y
            ;
    }

    /**
     * !#en Test rect and polygon
     * !#zh 测试矩形与多边形是否相交
     * @method rectPolygon
     * @param {Rect} a - The rect
     * @param {Vec2[]} b - The polygon, a set of points
     * @return {boolean}
     */
    static rectPolygon ( a, b ) {
        var i, l;
        var r0 = { x: a.x, y: a.y };
        var r1 = { x: a.x, y: a.yMax };
        var r2 = { x: a.xMax, y: a.yMax };
        var r3 = { x: a.xMax, y: a.y };

        // intersection check
        if ( Intersection.linePolygon( r0, r1, b ) )
            return true;

        if ( Intersection.linePolygon( r1, r2, b ) )
            return true;

        if ( Intersection.linePolygon( r2, r3, b ) )
            return true;

        if ( Intersection.linePolygon( r3, r0, b ) )
            return true;

        // check if a contains b
        for ( i = 0, l = b.length; i < l; ++i ) {
            if ( Intersection.pointInPolygon(b[i], a) )
                return true;
        }

        // check if b contains a
        if ( Intersection.pointInPolygon(r0, b) )
            return true;

        if ( Intersection.pointInPolygon(r1, b) )
            return true;

        if ( Intersection.pointInPolygon(r2, b) )
            return true;

        if ( Intersection.pointInPolygon(r3, b) )
            return true;

        return false;
    }

    /**
     * !#en Test polygon and polygon
     * !#zh 测试多边形与多边形是否相交
     * @method polygonPolygon
     * @param {Vec2[]} a - The first polygon, a set of points
     * @param {Vec2[]} b - The second polygon, a set of points
     * @return {boolean}
     */
    static polygonPolygon ( a, b ) {
        var i, l;
    
        // check if a intersects b
        for ( i = 0, l = a.length; i < l; ++i ) {
            var a1 = a[i];
            var a2 = a[(i+1)%l];
    
            if ( Intersection.linePolygon( a1, a2, b ) )
                return true;
        }
    
        // check if a contains b
        for ( i = 0, l = b.length; i < l; ++i ) {
            if ( Intersection.pointInPolygon(b[i], a) )
                return true;
        }
    
        // check if b contains a
        for ( i = 0, l = a.length; i < l; ++i ) {
            if ( Intersection.pointInPolygon( a[i], b ) )
                return true;
        }
    
        return false;
    }

    /**
     * !#en Test whether the point is in the polygon
     * !#zh 测试一个点是否在一个多边形中
     * @method pointInPolygon
     * @param {Vec2} point - The point
     * @param {Vec2[]} polygon - The polygon, a set of points
     * @return {boolean}
     */
    static pointInPolygon (point, polygon) {
        var inside = false;
        var x = point.x;
        var y = point.y;

        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        var length = polygon.length;

        for ( var i = 0, j = length-1; i < length; j = i++ ) {
            var xi = polygon[i].x, yi = polygon[i].y,
                xj = polygon[j].x, yj = polygon[j].y,
                intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if ( intersect ) inside = !inside;
        }

        return inside;
    }
}