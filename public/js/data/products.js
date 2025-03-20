// Product data from your successful Shopify store - maintaining exact functionality
const products = [
    {
        handle: 'monc-maya-jacket',
        title: 'Moncler Maya Jacket Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        options: [
            {
                name: 'Size',
                values: ['XS', 'S', 'M', 'XL', 'XXL']
            }
        ],
        variants: [
            {
                option1: 'XS',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: 'S',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -7,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: 'M',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -22,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: 'XL',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -16,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: 'XXL',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/07e84d_6d869f53bc43432a820d01b544d5a46b_mv2.webp?v=1729621576',
            alt: ''
        },
        rating_count: 81,
        status: 'active'
    },
    {
        handle: 'all-🍎-vendors-bundle',
        title: 'All Apple Vendors Bundle',
        body_html: '<p>All 🍎 Vendors from our Site for a Big Discount</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 149.95,
            compare_at_price: 289.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Applevendors.jpg?v=1729621551',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'all-clothing-accessories-bundle',
        title: 'All Clothing/accessories Bundle',
        body_html: '<p>Includes Pradaa Glasses, Monc Maya jacket, AF 1, Jrdn 1 and LV Belt vendors.<br>Save alot of Money and test all these vendors on your first purchase</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 94.95,
            compare_at_price: 189.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/clothingbildneu.jpg?v=1729621548',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'all-speaker-vendor-bundle',
        title: 'All Speaker Vendor Bundle',
        body_html: '<p>Includes Charge 5, Flip 6 and Pulse 5</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 39.95,
            compare_at_price: 89.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Nigga.jpg?v=1729621544',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'all-trending-vendors-bundle',
        title: 'All Trending Vendors Bundle',
        body_html: '<p>Includes s23 ultra, galaxyy buds, SM7B and supersonic dryer Vendors.<br>The best ones to resell at the moment. Updated weekly<br><br><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed<br></p>',
        vendor: 'Resell-Depot',
        product_category: 'Business & Industrial > Advertising & Marketing',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 169.95,
            compare_at_price: 245.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/trendingbild.jpg?v=1729621541',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'arforce',
        title: 'Airforce 1 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        options: [
            {
                name: 'Size',
                values: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
            }
        ],
        variants: [
            {
                option1: '36',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '37',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '38',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '39',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -4,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '40',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '41',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -3,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '42',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '43',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '44',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false
            },
            {
                option1: '45',
                price: 12.95,
                compare_at_price: 22.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/5375_618cee3da69a25.11590256_CW2288-111-2.webp?v=1729621612',
            alt: ''
        },
        rating_count: 274,
        status: 'active'
    },
    {
        handle: 'pods-pro-2-vendor',
        title: 'AirPods pro 2 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 19.95,
            compare_at_price: 29.95,
            inventory_quantity: -404,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/AirPods_Pro_2nd_Gen_with_USB-C_PDP_Image_Position-1__en-UScopy.webp?v=1729621609',
            alt: ''
        },
        rating_count: 274,
        status: 'active'
    },
    {
        handle: 'pods-max-vendor',
        title: 'AirPods Max Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 28.95,
            compare_at_price: 55.95,
            inventory_quantity: -74,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/dbcelx0cxdieuxn7vr1m.png?v=1729621607',
            alt: ''
        },
        rating_count: 89,
        status: 'active'
    },
    {
        handle: 'watch-ultra-vendor',
        title: 'Apple Watch Ultra Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 29.95,
            compare_at_price: 59.95,
            inventory_quantity: -19,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Apple_Watch_Ultra_Titanium_dff179dc-e883-490b-9c33-8c93201b1c9b.webp?v=1729621604',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'supersonic-dryer',
        title: 'Dyson Supersonic Dryer Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 39.95,
            compare_at_price: 79.95,
            inventory_quantity: -13,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/5ba3596ac2971a05b48a15e7.png?v=1729621601',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'charge-5-vendor',
        title: 'JBL charge 5 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 21.95,
            compare_at_price: 32.95,
            inventory_quantity: -6,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/JBL_CHARGE5_HERO_BLACK_0046_x1_55e1907d-f60e-4c12-8585-cded54424f28.webp?v=1729621597',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'flip-6-vendor-copy',
        title: 'JBL Flip 6 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 17.95,
            compare_at_price: 29.95,
            inventory_quantity: -6,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/6_JBL_FLIP_6_3_4_LEFT_BLACK_x1-500x500-1.png?v=1729621592',
            alt: ''
        },
        rating_count: 93,
        status: 'active'
    },
    {
        handle: 'pulse-5-vendor',
        title: 'JBL pulse 5 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 24.95,
            compare_at_price: 39.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/1_JBL_PULSE_5_HERO_34364_x2_406d3d40-68f9-4482-a929-ba5cf1d5b3d0.webp?v=1729621587',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'jrdn-1',
        title: 'Jordan 1 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 24.95,
            compare_at_price: 42.95,
            inventory_quantity: 0,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/DesignohneTitel-2023-04-17T143851.017.webp?v=1729621585',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'lv-belt-vendor',
        title: 'LV Belt Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 17.95,
            compare_at_price: 24.95,
            inventory_quantity: -9,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/louis-vuitton-lv-initiales-wendegurtel-30-mm--M0565T_PM2_Frontview.webp?v=1729621580',
            alt: ''
        },
        status: 'active'
    },
    {
        handle: 'phone-15-vendor',
        title: 'Iphone 15 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        options: [
            {
                name: 'Color',
                values: ['Black', 'Gray', 'Green']
            },
            {
                name: 'Storage',
                values: ['128GB', '256GB', '512GB']
            }
        ],
        variants: [
            {
                option1: 'Black',
                option2: '128GB',
                price: 79.99,
                compare_at_price: 99.99,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558'
                }
            },
            {
                option1: 'Black',
                option2: '256GB',
                price: 84.99,
                compare_at_price: 99.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558'
                }
            },
            {
                option1: 'Black',
                option2: '512GB',
                price: 94.99,
                compare_at_price: 99.99,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558'
                }
            },
            {
                option1: 'Gray',
                option2: '128GB',
                price: 79.99,
                compare_at_price: 99.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/65038654434d0-iPhone15ProNaturaltitaniumpng.png?v=1729621558'
                }
            },
            {
                option1: 'Gray',
                option2: '256GB',
                price: 84.99,
                compare_at_price: 99.99,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/65038654434d0-iPhone15ProNaturaltitaniumpng.png?v=1729621558'
                }
            },
            {
                option1: 'Gray',
                option2: '512GB',
                price: 94.99,
                compare_at_price: 99.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/65038654434d0-iPhone15ProNaturaltitaniumpng.png?v=1729621558'
                }
            },
            {
                option1: 'Green',
                option2: '128GB',
                price: 79.99,
                compare_at_price: 99.99,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/iPhone_15_Plus_iPhone_15_Green_Combo_Screen__WWEN_800x_aca2ece5-6db5-4405-ad1f-f1445bdfa772.webp?v=1729621558'
                }
            },
            {
                option1: 'Green',
                option2: '256GB',
                price: 84.99,
                compare_at_price: 99.99,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/iPhone_15_Plus_iPhone_15_Green_Combo_Screen__WWEN_800x_aca2ece5-6db5-4405-ad1f-f1445bdfa772.webp?v=1729621558'
                }
            },
            {
                option1: 'Green',
                option2: '512GB',
                price: 94.99,
                compare_at_price: 99.99,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/iPhone_15_Plus_iPhone_15_Green_Combo_Screen__WWEN_800x_aca2ece5-6db5-4405-ad1f-f1445bdfa772.webp?v=1729621558'
                }
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558',
            alt: ''
        },
        rating_count: 87,
        status: 'active'
    },
    {
        handle: 's23-ultra-vendor',
        title: 's23 Ultra Vendor',
        body_html: '<p><span><strong>Best  Margin Product!<br><br>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        options: [
            {
                name: 'Color',
                values: ['Black', 'Pink']
            },
            {
                name: 'Storage',
                values: ['256GB', '512GB', '1024GB']
            }
        ],
        variants: [
            {
                option1: 'Black',
                option2: '256GB',
                price: 84.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/full_body_housing_for_samsung_galaxy_s23_ultra_black_maxbhi_com_54246.jpg?v=1729621568'
                }
            },
            {
                option1: 'Black',
                option2: '512GB',
                price: 89.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/full_body_housing_for_samsung_galaxy_s23_ultra_black_maxbhi_com_54246.jpg?v=1729621568'
                }
            },
            {
                option1: 'Black',
                option2: '1024GB',
                price: 99.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/full_body_housing_for_samsung_galaxy_s23_ultra_black_maxbhi_com_54246.jpg?v=1729621568'
                }
            },
            {
                option1: 'Pink',
                option2: '256GB',
                price: 84.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/back.png?v=1729621568'
                }
            },
            {
                option1: 'Pink',
                option2: '512GB',
                price: 89.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/back.png?v=1729621568'
                }
            },
            {
                option1: 'Pink',
                option2: '1024GB',
                price: 99.99,
                compare_at_price: 119.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: {
                    src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/back.png?v=1729621568'
                }
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/full_body_housing_for_samsung_galaxy_s23_ultra_black_maxbhi_com_54246.jpg?v=1729621568',
            alt: ''
        },
        rating_count: 97,
        status: 'active'
    },
    {
        handle: 'galaxyy-buds',
        title: 'Galaxy  Buds Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        type: '',
        tags: '',
        published: true,
        variants: [{
            price: 19.95,
            compare_at_price: 29.95,
            inventory_quantity: -2,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Samsung-Galaxy-Buds-Pro-Silver-1_1.png?v=1729621571',
            alt: ''
        },
        status: 'active'
    }
];

// Make products available in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products };
} else {
    window.shopifyProducts = products;
}

// Function to fetch products - maintaining exact Shopify functionality
function fetchProducts() {
    return new Promise((resolve) => {
        // Simulating API call with local data
        setTimeout(() => {
            resolve(products);
        }, 100);
    });
}

// Make fetchProducts available globally
if (typeof window !== 'undefined') {
    window.fetchProducts = fetchProducts;
}
