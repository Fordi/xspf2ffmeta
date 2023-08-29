Bookmarks
  = "bookmarks" _ "=" _ r:BookmarkList _ { return r; }

BookmarkList
  = head:Bookmark tail:(_ "," _ r:Bookmark { return r; })* { return [head, ...tail]; }

Bookmark
  = "{" _ head:Property tail:(_ "," _ r:Property { return r; })* _ "}" { return [head, ...tail].reduce((o, [name, value]) => {
    o[name] = value;
    return o;
  }, {}); }

Property
  = "name" _ "=" _ name:$NameChar+ { return ["name", name]; }
  / "time" _ "=" _ time:$TimeChar+ { return ["time", parseFloat(time)]; }

NameChar
  = [^,]

TimeChar
  = [0-9\.]

_ = [ \r\n\t]*