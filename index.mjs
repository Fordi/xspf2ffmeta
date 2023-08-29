import { DOMParser } from 'xmldom-qsa';
import { readFile, writeFile } from 'fs/promises';
import peggy from 'peggy';


const bookmarkParser = peggy.generate(await readFile(new URL('./bookmarks.pegjs', import.meta.url), 'utf8'));

const dom = new DOMParser().parseFromString(await readFile(process.argv[2], 'utf8'), 'text/xml');
const playlist = dom.querySelector('playlist');
const NS = {};
for (let i = 0; i < playlist.attributes.length; i++) {
    const attr = playlist.attributes[i];
    if (attr.prefix === 'xmlns') {
        NS[attr.localName] = attr.value;
    } else if (attr.nodeName === 'xmlns') {
        NS.$ = attr.value;
    }
}

const tracks = [...playlist.querySelectorAll('trackList>track')];
await Promise.all(tracks.map(async (track) => {
    const buffer = [';FFMETADATA1'];
    const location = new URL(track.querySelector('location').textContent);
    const duration = parseFloat(track.querySelector('duration').textContent);

    if (location.protocol !== 'file:') return null;
    const bookmarks = track.querySelector('extension[application="http://www.videolan.org/vlc/playlist/0"]>vlc\\:option');
    const chapters = bookmarkParser.parse(bookmarks.textContent);
    const metaFile = `${location.pathname}.ffmeta`;
    const metaContent = [
        ';FFMETADATA1',
        ...chapters.map(({ name, time }, index) => {
            const end = chapters[index + 1]?.time ?? duration;
            return [
                '[CHAPTER]',
                'TIMEBASE=1/1000',
                `START=${Math.floor(time * 1000)}`,
                `END=${Math.floor(end * 1000)}`,
                `title=${name.replace(/([^A-Za-z0-9 ])/g, '\\$1')}`,
                '',
            ].join('\n');
        }),
    ].join('\n')
    await writeFile(metaFile, metaContent, 'utf8');
}));
