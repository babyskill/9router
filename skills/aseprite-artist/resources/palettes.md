# Retro & Modern Pixel Art Palettes — Full Hex Reference

## Console Palettes

### Game Boy (4 colors)
```
#0F380F  #306230  #8BAC0F  #9BBC0F
```

### Game Boy Gray (4 colors)
```
#000000  #555555  #AAAAAA  #FFFFFF
```

### NES (54 colors)
```
#7C7C7C  #0000FC  #0000BC  #4428BC  #940084  #A80020  #A81000  #881400
#503000  #007800  #006800  #005800  #004058  #000000  #000000  #000000
#BCBCBC  #0078F8  #0058F8  #6844FC  #D800CC  #E40058  #F83800  #E45C10
#AC7C00  #00B800  #00A800  #00A844  #008888  #000000  #000000  #000000
#F8F8F8  #3CBCFC  #6888FC  #9878F8  #F878F8  #F85898  #F87858  #FCA044
#F8B800  #B8F818  #58D854  #58F898  #00E8D8  #787878  #000000  #000000
#FCFCFC  #A4E4FC  #B8B8F8  #D8B8F8  #F8B8F8  #F8A4C0  #F0D0B0  #FCE0A8
#F8D878  #D8F878  #B8F8B8  #B8F8D8  #00FCFC  #F8D8F8  #000000  #000000
```

### Commodore 64 (16 colors)
```
#000000  #FFFFFF  #880000  #AAFFEE  #CC44CC  #00CC55  #0000AA  #EEEE77
#DD8855  #664400  #FF7777  #333333  #777777  #AAFF66  #0088FF  #BBBBBB
```

### CGA Mode 4 Palette 1 (4 colors)
```
#000000  #55FFFF  #FF55FF  #FFFFFF
```

### SNES (First 16 of typical palette)
```
#000000  #7F0000  #007F00  #7F7F00  #00007F  #7F007F  #007F7F  #7F7F7F
#3F3F3F  #FF0000  #00FF00  #FFFF00  #0000FF  #FF00FF  #00FFFF  #FFFFFF
```

---

## Modern Pixel Art Palettes

### PICO-8 (16 colors)
```
#000000  #1D2B53  #7E2553  #008751  #AB5236  #5F574F  #C2C3C7  #FFF1E8
#FF004D  #FFA300  #FFEC27  #00E436  #29ADFF  #83769C  #FF77A8  #FFCCAA
```

### Sweetie 16 by GrafxKid
```
#1A1C2C  #5D275D  #B13E53  #EF7D57  #FFCD75  #A7F070  #38B764  #257179
#29366F  #3B5DC9  #41A6F6  #73EFF7  #F4F4F4  #94B0C2  #566C86  #333C57
```

### DawnBringer DB16
```
#140C1C  #442434  #30346D  #4E4A4F  #854C30  #346524  #D04648  #757161
#597DCE  #D27D2C  #8595A1  #6DAA2C  #D2AA99  #6DC2CA  #DAD45E  #DEEED6
```

### DawnBringer DB32
```
#000000  #222034  #45283C  #663931  #8F563B  #DF7126  #D9A066  #EEC39A
#FBF236  #99E550  #6ABE30  #37946E  #4B692F  #524B24  #323C39  #3F3F74
#306082  #5B6EE1  #639BFF  #5FCDE4  #CBDBFC  #FFFFFF  #9BADB7  #847E87
#696A6A  #595652  #76428A  #AC3232  #D95763  #D77BBA  #8F974A  #8A6F30
```

---

## Generic Palettes

### Retro 16
```
#000000  #9D9D9D  #FFFFFF  #BE2633  #E06F8B  #493C2B  #A46422  #EB8931
#F7E26B  #2F484E  #44891A  #A3CE27  #1B2632  #005784  #31A2F2  #B2DCEF
```

### Retro 8
```
#000000  #FFFFFF  #FF0000  #00FF00  #0000FF  #FFFF00  #FF00FF  #00FFFF
```

### Grayscale 4
```
#000000  #555555  #AAAAAA  #FFFFFF
```

### Grayscale 8
```
#000000  #242424  #494949  #6D6D6D  #929292  #B6B6B6  #DBDBDB  #FFFFFF
```

### Grayscale 16
```
#000000  #111111  #222222  #333333  #444444  #555555  #666666  #777777
#888888  #999999  #AAAAAA  #BBBBBB  #CCCCCC  #DDDDDD  #EEEEEE  #FFFFFF
```

---

## Usage in MCP Calls

### Set palette for Game Boy sprite
```
set_palette(sprite_path, colors: ["#0F380F", "#306230", "#8BAC0F", "#9BBC0F"])
```

### Set palette for PICO-8 sprite
```
set_palette(sprite_path, colors: [
  "#000000", "#1D2B53", "#7E2553", "#008751",
  "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
  "#FF004D", "#FFA300", "#FFEC27", "#00E436",
  "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
])
```

### Quantize to retro palette
```
quantize_palette(
  sprite_path,
  target_colors: 16,
  algorithm: "median_cut",
  convert_to_indexed: true,
  dither: true
)
```
