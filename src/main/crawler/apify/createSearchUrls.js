function getBaseUrl(country) {
    const baseUrls = {
        US: 'https://www.amazon.com/',
        GB: 'https://www.amazon.co.uk/',
        DE: 'https://www.amazon.de/',
        ES: 'https://www.amazon.es/',
        FR: 'https://www.amazon.fr/',
        IT: 'https://www.amazon.it/',
        IN: 'https://www.amazon.in/',
        CA: 'https://www.amazon.ca/',
        CN: 'https://www.amazon.com/',
    };
    const url = baseUrls[country];
    if (!url) throw new Error('Selected country is not supported, contact us.');
    return url;
}

export async function createSearchUrls(input) {
    // 必须传入国家
    if (!input.country) {
        throw new Error('Country required');
    }
    let searchUrlBase = getBaseUrl(input.country.toUpperCase());
    if (input.asins) {
        console.log(`Going to enqueue ${input.asins.length} asins`);
        const builtUrls = [];
        for (const item of input.asins) {
            const sellerUrl = `${searchUrlBase}gp/offer-listing/${item}`;
            builtUrls.push({
                url: sellerUrl,
                userData: {
                    label: 'seller',
                    asin: item,
                    detailUrl: `${searchUrlBase}dp/${item}`,
                    sellerUrl,
                    country: input.country.toUpperCase(),
                },
            });
        }
        return builtUrls;
    }


    if (!input.keywords || !input.keywords.length) {
        throw new Error('Keywords required');
    }
    searchUrlBase = getBaseUrl(input.country);
    return input.keywords.map((keyword) => ({
        url: `${searchUrlBase}s?k=${keyword.replace(/\\s/g, '+').trim()}`,
        userData: {
            label: 'page',
            keyword,
        },
    }));
}

