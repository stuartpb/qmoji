import EmojiRegex from "https://cdn.skypack.dev/emoji-regex";
import insertText from 'https://cdn.jsdelivr.net/npm/insert-text-at-cursor@0.3.0/index.js';

const emojiRegex = EmojiRegex();
const input = document.querySelector('input');
const iframe = document.querySelector('iframe');

document.querySelector('emoji-picker').addEventListener('emoji-click', e => {
  insertText(input, e.detail.unicode);
});

async function getWikidataID(url) {
  const jsonld = await fetch({
    url: `https://query.wikidata.org/bigdata/ldf?subject=${
      encodeURIComponent(url)}&predicate=http%3A%2F%2Fschema.org%2Fabout&object=%3Fitem`,
    headers: {Accept: 'application/ld+json'}
  }).then(res=>res.json());
  for (const item of jsonld['@graph']) {
    if (item['@id'] == url) {
      return parseInt(item.about.replace(/^wd:/, ''));
    }
  }
  throw new Error('not found I guess?')
}

const facts = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800,
  39916800, 479001600, 6227020800, 87178291200, 1307674368000];

function fact(n) {
  while (facts.length <= n) { // this should never happen in our use case
    facts[facts.length] = facts.length * facts[facts.length-1];
  }
  return facts[n];
}

function uniqcounts(items) {
  const uniq = [];
  const counts = [];
  for (const item of items) {
    let i = 0;
    while (i < uniq.length && uniq[i] < item) ++i;
    if (i < uniq.length) {
      if (uniq[i] == item) {
        ++counts[i];
      } else {
        uniq.splice(i,0,item);
        counts.splice(i,0,1);
      }
    } else {
      uniq[i] = item;
      counts[i] = 1;
    }
  }
  return [uniq, counts];
}

function cardinality(counts) {
  let x = 0;
  for (const count of counts) x += count;
  x = fact(x);
  for (const count of counts) x /= fact(count);
  return x;
}

function unrank(rankn, uniq, counts) {
  const items = [];
  // TODO
}

// this is busted
function rank(items) {
  const [uniq, counts] = uniqcounts(items);
  let x = 0;
  for (const item of items) {
    let i = 0;
    while (uniq[i] < item) ++i;
    --counts[i];
    if (counts[i] == 0) {
      uniq.splice(i, 1);
      counts.splice(i, 1);
    }
    x += i * cardinality(counts); 
  }
  return x + 1;
}

let selectedQID = 0;

function parseEmoji() {
  const emoji = [...input.value.matchAll(emojiRegex)];
  if (emoji.length) {
    const [uniq, counts] = uniqcounts(emoji);
    if (selectedQID) {
      if (cardinality(counts) >= selectedQID) {

      }
    } else {
      // TODO: test for validity
      displayQID(rank(emoji));
    }
  }
}

function displayQID(qid) {
  iframe.src = `https://portal.toolforge.org/Q${qid}`;
}

async function submitForm() {
  const qid = await getWikidataID(input.value);
  selectedQID = qid;
  displayQID(qid);
}
