/* Shared, fixed-frame geometry. No browser-dependent CSS division or stretching. */
(function(root){
  function thumbnailGeometry(layout){
    const columns=layout.columns,rows=layout.rows,gap=7;
    const scale=Math.min(1,84/(columns*26+(columns-1)*gap),100/(rows*(26/0.6)+(rows-1)*gap));
    const width=26*scale,height=width/0.6,stepX=(26+gap)*scale,stepY=(26/0.6+gap)*scale;
    const left=(104-(columns*26+(columns-1)*gap)*scale)/2;
    const top=(120-(rows*(26/0.6)+(rows-1)*gap)*scale)/2;
    const px=n=>Number(n.toFixed(4))+'px';
    return layout.cells.map(cell=>{
      const column=Array.isArray(cell)?cell[0]:cell.column,row=Array.isArray(cell)?cell[1]:cell.row;
      return {'--thumb-x':px(left+(column-1)*stepX),'--thumb-y':px(top+(row-1)*stepY),'--thumb-w':px(width),'--thumb-h':px(height)};
    });
  }
  root.TAROT_THUMBNAIL={thumbnailGeometry};
  if(typeof module==='object'&&module.exports)module.exports={thumbnailGeometry};
})(typeof window==='object'?window:{});
