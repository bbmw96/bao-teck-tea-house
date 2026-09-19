/* ====================================================================
   SHARED DETAILS
   Prices, phone, WhatsApp, address, opening hours, photo filenames.
   The SAME in every language. Change them once, here.
   ====================================================================

   OWNER: edit the words between the quote marks below.
   Do NOT change the lines above the opening brace, or the very last line.

   Change only the text on the RIGHT of each colon:

       "title": "Change these words, not the ones on the left",

   Keep the quote marks. Keep the comma at the end of the line.
   ==================================================================== */

window.BTTH = window.BTTH || {};
window.BTTH.lang = window.BTTH.lang || {};
window.BTTH.shared = {
  "_README": "This file holds information that is THE SAME IN EVERY LANGUAGE - prices, phone numbers, photo filenames, opening times. The words (dish names, descriptions) live in the /languages/ folder instead. Edit prices and contact details HERE, once, and they change in all 7 languages at the same time.",
  "contact": {
    "phone": "+604 263 1100",
    "phoneLink": "+6042631100",
    "email": "REPLACE-WITH-YOUR-EMAIL@example.com",
    "_email_note": "OWNER: put your real email address here. Until you do, the contact page will show a note asking visitors to phone instead.",
    "addressLine1": "25, Lebuh Melayu",
    "addressLine2": "10100 George Town",
    "addressCity": "Penang",
    "addressCountry": "Malaysia",
    "postcode": "10100",
    "_postcode_note": "Sources disagree: some list 10100, some 10300. Please confirm and correct if needed.",
    "latitude": 5.4132765,
    "longitude": 100.3352301,
    "mapsUrl": "https://www.google.com/maps/place/Bao+Teck+Tea+House/@5.4132765,100.3352301,17z",
    "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.024254235856!2d100.33265517289236!3d5.413276494565919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304ac346f3b8db6d%3A0x8494e1ff193637a4!2sBao%20Teck%20Tea%20House!5e0!3m2!1sen!2smy!4v1743967152415!5m2!1sen!2smy",
    "whatsapp": "+60 19-677 7838",
    "whatsappLink": "60196777838",
    "whatsappUrl": "https://wa.me/60196777838",
    "_whatsapp_note": "Taken from the WhatsApp link on the official Facebook page. Messages open straight into WhatsApp on a phone, or WhatsApp Web on a computer.",
    "reservationFormEndpoint": "",
    "_reservationFormEndpoint_note": "OWNER: the reservation form on the Reserve page can email you a copy of every request, in addition to opening WhatsApp. To switch this on: go to formspree.io, make a free account, create one form pointed at your real email address above, and paste the web address it gives you here (it looks like https://formspree.io/f/abcdwxyz). Leave this blank and the form will still work, it will just skip the email and rely on WhatsApp alone."
  },
  "social": {
    "facebook": "https://www.facebook.com/baoteck25",
    "instagram": "https://www.instagram.com/baoteckteahouse/",
    "tiktok": "https://www.tiktok.com/place/Bao-Teck-Tea-House-34955879829578988",
    "michelin": "https://guide.michelin.com/my/en/pulau-pinang/my-george-town/restaurant/bao-teck-tea-house",
    "tripadvisor": "https://www.tripadvisor.co.uk/Restaurant_Review-g298303-d21254606-Reviews-Bao_Teck_Tea_House-George_Town_Penang_Island_Penang.html"
  },
  "hours": {
    "_IMPORTANT_OWNER_NOTE": "PLEASE CHECK AND CORRECT THESE. Published sources disagree with each other. Blogs from 2020-21 say 8am-8pm closed Wednesdays. The Michelin Guide has listed shorter afternoon closings. One 2021 source says Mon-Thu 8am-2pm, Fri-Sun 8am-6pm. Set your REAL times below - this is the single most important thing for customers.",
    "monday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "tuesday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "wednesday": {
      "open": null,
      "close": null,
      "closed": true
    },
    "thursday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "friday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "saturday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "sunday": {
      "open": "08:00",
      "close": "20:00",
      "closed": false
    },
    "highTea": {
      "start": "14:00",
      "end": "17:00"
    }
  },
  "brand": {
    "nameLatin": "Bao Teck Tea House",
    "nameChinese": "包德館",
    "nameChineseTrad": "包德館",
    "established": 2020,
    "parentCompany": "Ming Xiang Tai",
    "parentCompanyChinese": "名香泰",
    "logoGlyph": "包",
    "nameChineseSimp": "包德馆",
    "_name_note": "The carved sign above the door uses the TRADITIONAL form 包德館. The simplified form 包德馆 is only used in the Mandarin edition of the site.",
    "cityChinese": "檳城",
    "legalName": "Ming Xiang Tai Ethnic Cuisines Sdn. Bhd.",
    "formerName": "Ming Xiang Tai Pastry Delights Sdn. Bhd.",
    "registrationNo": "201301032930 (1062759-V)",
    "mottoRight": "貨真價實",
    "mottoLeft": "童叟無欺",
    "_motto_note": "The two vertical inscriptions carved on the sign. A traditional pair of merchant pledges: genuine goods at honest prices, and never cheating anyone, young or old.",
    "logoFile": "",
    "_logoFile_note": "OWNER: the website shows your shop's name set in type until you add your real logo. To switch on the real one: save the file into 01-WEBSITE/images/brand/, then put its file name here between the quote marks (for example \"logo.svg\" or \"logo.png\"). A see-through PNG or an SVG both work best. Leave this blank and the site keeps showing the name in type, which is deliberate: it never invents a logo of its own. See GUIDE 6 in 03-HOW-TO-GUIDES for the full walk-through."
  },
  "_MENU_NOTE": "PRICES BELOW WERE PUBLISHED BY FOOD WRITERS IN 2020-2021 AND ARE ALMOST CERTAINLY OUT OF DATE. Please update every 'price' number to your current prices before the site goes live. Set 'price' to null to hide the price entirely and show 'ask in store' instead.",
  "menu": {
    "categories": [
      "signature",
      "steamed",
      "fried",
      "buns",
      "sweet",
      "sets"
    ],
    "items": [
      {
        "id": "crystal-seafood-dumpling",
        "cat": "signature",
        "price": 23.8,
        "unit": 4,
        "image": "images/dishes/crystal-seafood-dumpling.jpg",
        "glyph": "餃",
        "tags": [
          "chef",
          "seafood"
        ]
      },
      {
        "id": "prawn-dumpling",
        "cat": "signature",
        "price": 9.8,
        "unit": 3,
        "image": "images/dishes/prawn-dumpling.jpg",
        "glyph": "蝦",
        "tags": [
          "chef",
          "seafood"
        ]
      },
      {
        "id": "siew-mai",
        "cat": "signature",
        "price": 8.8,
        "unit": 3,
        "image": "images/dishes/siew-mai.jpg",
        "glyph": "燒",
        "tags": [
          "chef"
        ]
      },
      {
        "id": "snowy-char-siew-bun",
        "cat": "signature",
        "price": 8.8,
        "unit": 3,
        "image": "images/dishes/snowy-char-siew-bun.jpg",
        "glyph": "包",
        "tags": [
          "chef"
        ]
      },
      {
        "id": "egg-tart",
        "cat": "signature",
        "price": 8.8,
        "unit": 3,
        "image": "images/dishes/egg-tart.jpg",
        "glyph": "撻",
        "tags": [
          "chef",
          "sweet"
        ]
      },
      {
        "id": "spinach-prawn-dumpling",
        "cat": "steamed",
        "price": 9.8,
        "unit": 3,
        "image": "images/dishes/spinach-prawn-dumpling.jpg",
        "glyph": "菠",
        "tags": [
          "seafood"
        ]
      },
      {
        "id": "beancurd-sheet-roll",
        "cat": "steamed",
        "price": 9,
        "unit": 3,
        "image": "images/dishes/beancurd-sheet-roll.jpg",
        "glyph": "卷",
        "tags": []
      },
      {
        "id": "golden-radish-cake",
        "cat": "steamed",
        "price": 8.8,
        "unit": 6,
        "image": "images/dishes/golden-radish-cake.jpg",
        "glyph": "糕",
        "tags": []
      },
      {
        "id": "money-bag-dumpling",
        "cat": "steamed",
        "price": null,
        "unit": 3,
        "image": "images/dishes/money-bag-dumpling.jpg",
        "glyph": "袋",
        "tags": []
      },
      {
        "id": "prawn-roll",
        "cat": "fried",
        "price": 8.8,
        "unit": 3,
        "image": "images/dishes/prawn-roll.jpg",
        "glyph": "酥",
        "tags": [
          "seafood"
        ]
      },
      {
        "id": "phoenix-ball",
        "cat": "fried",
        "price": 8.8,
        "unit": 1,
        "image": "images/dishes/phoenix-ball.jpg",
        "glyph": "鳳",
        "tags": [
          "chef"
        ]
      },
      {
        "id": "taro-puff",
        "cat": "fried",
        "price": null,
        "unit": 3,
        "image": "images/dishes/taro-puff.jpg",
        "glyph": "芋",
        "tags": [
          "chef"
        ]
      },
      {
        "id": "sesame-ball",
        "cat": "fried",
        "price": 8.8,
        "unit": 3,
        "image": "images/dishes/sesame-ball.jpg",
        "glyph": "煎",
        "tags": [
          "sweet"
        ]
      },
      {
        "id": "steamed-stuffed-bun",
        "cat": "buns",
        "price": 18,
        "unit": 1,
        "image": "images/dishes/steamed-stuffed-bun.jpg",
        "glyph": "大",
        "tags": [
          "chef"
        ]
      },
      {
        "id": "ko-cha-siew-pao",
        "cat": "buns",
        "price": null,
        "unit": 3,
        "image": "images/dishes/ko-cha-siew-pao.jpg",
        "glyph": "叉",
        "tags": []
      },
      {
        "id": "prawn-dumpling-noodle",
        "cat": "signature",
        "price": 16.8,
        "unit": 1,
        "image": "images/dishes/prawn-dumpling-noodle.jpg",
        "glyph": "麵",
        "tags": [
          "seafood"
        ]
      },
      {
        "id": "mystery-garden",
        "cat": "sweet",
        "price": null,
        "unit": 1,
        "image": "images/dishes/mystery-garden.jpg",
        "glyph": "園",
        "tags": [
          "veg",
          "sweet"
        ]
      },
      {
        "id": "grand-high-tea",
        "cat": "sets",
        "price": 34,
        "unit": 1,
        "image": "images/dishes/grand-high-tea.jpg",
        "glyph": "茗",
        "tags": [
          "chef"
        ]
      }
    ]
  },
  "teas": {
    "_note": "Chinese teas were published from RM36 per pot; English teas RM38 per pot; bringing your own tea leaves was RM5 per person. UPDATE THESE.",
    "byoCorkage": 5,
    "items": [
      {
        "id": "big-red-robe",
        "price": 36,
        "origin": "chinese",
        "native": "大红袍"
      },
      {
        "id": "big-leaf-2018",
        "price": 36,
        "origin": "chinese",
        "native": "古韵"
      },
      {
        "id": "white-shoumei",
        "price": 36,
        "origin": "chinese",
        "native": "寿眉"
      },
      {
        "id": "oolong-yanyun",
        "price": 36,
        "origin": "chinese",
        "native": "岩韵"
      },
      {
        "id": "liubao-2008",
        "price": 36,
        "origin": "chinese",
        "native": "六堡"
      },
      {
        "id": "earl-grey",
        "price": 38,
        "origin": "english",
        "native": "Earl Grey"
      },
      {
        "id": "rooibos",
        "price": 38,
        "origin": "english",
        "native": "Rooibos"
      }
    ]
  },
  "gallery": [
    {
      "image": "images/gallery/gallery-01.jpg",
      "captionKey": "gallery.items.moss",
      "glyph": "苔"
    },
    {
      "image": "images/gallery/gallery-02.jpg",
      "captionKey": "gallery.items.airwell",
      "glyph": "井"
    },
    {
      "image": "images/gallery/gallery-03.jpg",
      "captionKey": "gallery.items.tiles",
      "glyph": "磚"
    },
    {
      "image": "images/gallery/gallery-04.jpg",
      "captionKey": "gallery.items.staircase",
      "glyph": "梯"
    },
    {
      "image": "images/gallery/gallery-05.jpg",
      "captionKey": "gallery.items.upperRoom",
      "glyph": "樓"
    },
    {
      "image": "images/gallery/gallery-06.jpg",
      "captionKey": "gallery.items.cabinets",
      "glyph": "櫃"
    },
    {
      "image": "images/gallery/gallery-07.jpg",
      "captionKey": "gallery.items.teaCounter",
      "glyph": "茶"
    },
    {
      "image": "images/gallery/gallery-08.jpg",
      "captionKey": "gallery.items.steamer",
      "glyph": "蒸"
    },
    {
      "image": "images/gallery/gallery-09.jpg",
      "captionKey": "gallery.items.facade",
      "glyph": "門"
    },
    {
      "image": "images/gallery/gallery-10.jpg",
      "captionKey": "gallery.items.pouring",
      "glyph": "壺"
    },
    {
      "image": "images/gallery/gallery-11.jpg",
      "captionKey": "gallery.items.marbleTable",
      "glyph": "桌"
    },
    {
      "image": "images/gallery/gallery-12.jpg",
      "captionKey": "gallery.items.window",
      "glyph": "窗"
    }
  ],
  "images": {
    "_note": "Change these paths to point at your own photos. Drop the photo into the matching folder and put its filename here. If a photo is missing the site shows decorative artwork instead - it will never look broken.",
    "heroHome": "images/hero/hero-home.jpg",
    "heroMenu": "images/hero/hero-menu.jpg",
    "heroStory": "images/hero/hero-story.jpg",
    "heroTea": "images/hero/hero-tea.jpg",
    "heroGallery": "images/hero/hero-gallery.jpg",
    "heroVisit": "images/hero/hero-visit.jpg",
    "mossGarden": "images/venue/moss-garden.jpg",
    "upperFloor": "images/venue/upper-floor.jpg",
    "facade": "images/venue/facade.jpg",
    "teaRitual": "images/tea/tea-ritual.jpg",
    "ogImage": "images/og/og-default.jpg"
  },
  "stats": [
    {
      "value": 2020,
      "labelKey": "home.stats.opened",
      "suffix": ""
    },
    {
      "value": 2,
      "labelKey": "home.stats.floors",
      "suffix": ""
    },
    {
      "value": 7,
      "labelKey": "home.stats.teas",
      "suffix": "+"
    },
    {
      "value": 100,
      "labelKey": "home.stats.madeToOrder",
      "suffix": "%"
    }
  ]
};
