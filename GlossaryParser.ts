/*
* pattern: 
* 1. one or two a tags with short name (ex: `<a name="abern-martin"></a>`)
* 2. <p>&#160;</p> (can ignore)
* 3. p.term with the name of the person (ex: `<p class="term">Abern, Martin  (1898-1949)</p>`)
* 4. content until the next person
*/

export interface Glossary{
    shortname:string[] | undefined;
    term:string  | undefined;
    content:string  | undefined;
}

export function glossary(html:string): Glossary[]{
    let glossary_list = html.split(/<a\s*name\=\"(.*?)"\s*>\s*<\s*\/a>/).filter(x => x.trim() != '\n' && x.trim() != '');
    glossary_list.shift();
    //console.log(glossary_list.filter(x => /^[\w\-]*$/.test(x.trim())));
    let object_list:Glossary[] = []

    let has_added_content:boolean = false;
    glossary_list.forEach((str, index) => {
        if (/^[\w\-]*$/.test(str.trim())) { // short-names
            if (!has_added_content && object_list.length > 0 && object_list[object_list.length - 1].content === undefined) {
                //console.log(`${str.trim()}: has other shortname`);
                object_list[object_list.length - 1].shortname?.push(str.trim());
            } else {
                object_list.push({ shortname: [str.trim()], term: undefined, content: undefined });
            }
        } else {
            if (object_list.length > 0) {
                let bio = str.split(/<\s*?(p|span)\s*?class=\"term\".*?>([\w\W]*?)<\s*?\/\s*?(p|span)\s*?>/).filter(x => x != 'span' && x != 'p');
                //console.log('Bio Length', bio.length, bio);
                if(bio.length === 3){
                    object_list[object_list.length - 1].term = bio[1];
                    object_list[object_list.length - 1].content = bio[2];
                }else
                    console.log('Bio', bio);
                
            } else {
                console.log('No previous shortname to associate content with.');
            }
        }
    });

    return object_list;
}