import { Component, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Input, Output } from '@angular/core';

import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { OwlCarousel } from 'ngx-owl-carousel';

declare var CarrouselRendering: any;
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel';


import { ElasticService } from '../../../../_services/query-services/elastic.service';


@Component({
    selector: 'commons-graph-filter',
    templateUrl: "./graph-filter.component.html",
    styleUrls: ["./graph-filter.component.css"],

    host: {
        '(window:resize)': 'onResize()'
    }
})
export class GraphFilterComponent implements OnInit {

    @ViewChild('owlElement') owlElement: OwlCarousel
    public indexType: string;
    public jsonQueryFilter: any;

    public screenWidth: number;


    public listTermsSearch: any;

    public listTermsSelectedSearch: any;


    public jsonQueryXpackFilter: any;
    public filterData: any;

    public listTermsSectionBlock: boolean;
    public stopWordsListCustom: any;
    public stopWordsListSpanish: any;

    public componentLocalLoading: boolean;
    public componentLocalInit: boolean;


    public lastQueryString: string;
    public newQueryString: string;

    public lastClickedActivated: number;
    public lastClickedIndex: number;

    constructor(
        private _script: ScriptLoaderService,
        private _elasticService: ElasticService
    ) {
        this.indexType = "";

        this.filterData = [];

        this.jsonQueryXpackFilter = { "track_total_hits": true, "query": {}, "aggregations": { "significant_elements": { "significant_terms": { "field": "message", "size": 60, "exclude": [] }, "aggregations": { "details": { "top_hits": { "size": 1, "_source": { "includes": ["message", "id", "origin"] } } }, "reach": { "sum": { "script": "doc['totalLikes'].value" } } } } } };

        //stopwords
        this.stopWordsListCustom = ["shared","from","photo","photos","url","awesome","take","look","this","ver", "asi", "mas", "usted", "hecho", "ademas", "quiero", "vea", "vio", "mira", "ojala", 'muchas', 'hola', "mediante", "anos", "shared", "from", "photo", "photos", "timeline","costa","rica"];
        this.stopWordsListSpanish = ["aca", "ahi", "ahora", "ajena", "ajeno", "algo", "algun", "alla", "alli", "ambos", "ante", "antes", "aquel", "aqui", "asi", "atras", "aun", "ayer", "bajo", "bien", "breve", "buen", "buena", "bueno", "cabe", "cada", "casi", "cerca", "cinco", "claro", "como", "con", "cosas", "creo", "cual", "cuan", "dado", "dan", "dar", "debe", "deben", "decir", "dejar", "dejo", "del", "demas", "desde", "dia", "dias", "dice", "dicen", "dicho", "dijo", "dio", "donde", "dos", "ella", "ellas", "ello", "ellos", "entre", "era", "erais", "eran", "eras", "eres", "esa", "esas", "ese", "eso", "esos", "esta", "", "estad", "estan", "estar", "estas", "", "este", "", "esten", "estes", "esto", "estos", "estoy", "etc", "fin", "final", "fue", "fuera", "fuese", "fui", "gran", "gueno", "haber", "habia", "habla", "habra", "habre", "hace", "hacen", "hacer", "haces", "hacia", "hago", "han", "has", "hasta", "hay", "haya", "hayan", "hayas", "hecho", "hemos", "hizo", "horas", "hoy", "http", "https", "hube", "hubo", "igual", "jamas", "junto", "lado", "largo", "las", "lejos", "les", "link", "llego", "lleva", "los", "luego", "lugar", "mal", "mas", "mayor", "medio", "mejor", "menos", "mia", "mias", "mio", "mios", "mis", "misma", "mismo", "modo", "mucha", "mucho", "muy", "nada", "nadie", "nos", "nueva", "nuevo", "nunca", "ocho", "otra", "otras", "otro", "otros", "para", "parte", "peor", "pero", "pesar", "poca", "pocas", "poco", "pocos", "poder", "podra", "poner", "por", "", "pudo", "pueda", "puede", "puedo", "pues", "qeu", "que", "", "quedo", "quien", "quiza", "raras", "sabe", "saben", "saber", "sabes", "sal", "salvo", "sea", "seais", "sean", "seas", "segun", "seis", "ser", "sera", "seran", "seras", "sere", "seria", "sido", "siete", "sigue", "sin", "sino", "sobre", "sois", "sola", "solas", "solo", "solos", "somos", "son", "soy", "soyos", "sra", "sres", "sta", "sus", "suya", "suyas", "suyo", "suyos", "tal", "tales", "tan", "tanta", "tanto", "tambien", "tarde", "tened", "tener", "tenga", "tengo", "tenia", "tiene", "toda", "todas", "todo", "todos", "tomar", "total", "tras", "trata", "tres", "tus", "tuve", "tuvo", "tuya", "tuyas", "tuyo", "tuyos", "una", "unas", "uno", "unos", "usa", "usais", "usan", "usar", "usas", "uso", "usted", "vais", "valor", "vamos", "van", "vaya", "veces", "ver", "vez", "voy"];
        this.listTermsSectionBlock = false;



        this.screenWidth = window.screen.width;
        this._script.loadScripts('body', [
            'assets/vendors/custom/owl-carousel/owl.carousel.js',
            'assets/app/js/general/owl-carousel-init.js'
        ], true).then(() => {
            Helpers.setLoading(false);
        });
        this.listTermsSearch = [];
        this.listTermsSelectedSearch = [];
        CarrouselRendering.init_graphfilter();



        this.componentLocalInit = false;
        this.componentLocalLoading = false;

        //default query string
        this.lastQueryString = "*";
        this.newQueryString = "*";

        /*carousel */
        this.lastClickedIndex = -1;
        this.lastClickedActivated = 0;
    }


    @Input()
    set localGraphFilterData(filterData_: any) {
        if (filterData_ != undefined && !this.componentLocalLoading) {
            //Clean Carousel

            this.componentLocalLoading = true;
            this.listTermsSectionBlock = true;

            CarrouselRendering.reInit_graphfilter();

            this.filterData = filterData_;
            this.jsonQueryXpackFilter.query = this.filterData.filterQuery.query;
            this.indexType = filterData_['indexType'];

            //Verif if is an normal or advance search and get query string
            if(this.filterData.filterQuery.query.bool.must[1].hasOwnProperty('query_string'))
                this.newQueryString = this.filterData.filterQuery.query.bool.must[1].query_string.query;
            else{
                this.newQueryString = this.filterData.filterQuery.query.bool.must[1].more_like_this.like;
            }

            //if querys are diffenent so it's required create a new array
            if (this.newQueryString !== this.lastQueryString) {
                this.lastQueryString = "*"
                this.listTermsSelectedSearch = [];
                this.listTermsSearch = [];
            }


            //Load Last Selected Terms
            if (this.listTermsSelectedSearch.length == 0)
                this.listTermsSearch = this.listTermsSelectedSearch;
            else {
                //Add an extre item to allow clean all selected terms
                this.listTermsSearch = [];
                this.listTermsSearch.push({ "token": "X", 'importance': 0, "reach": 0, "doc_count": 0, "state": -1, "origin": 0, "sample": "" })
                this.listTermsSearch = this.listTermsSearch.concat(this.listTermsSelectedSearch);
            }

            if (this.newQueryString != '*')
                this.getFilterTokens(this.newQueryString);
            else {
                this.jsonQueryXpackFilter.aggregations.significant_elements.significant_terms.exclude = [];
                this.getGraphFilterData();
            }


        }
    }


    @Input()
    set localLoadingSectionBlock(localSectionBlock_: any) {
        if (localSectionBlock_ != undefined) {
            if (this.componentLocalInit && localSectionBlock_) {


                this.listTermsSectionBlock = true;
                //Clean Carousel
                CarrouselRendering.reInit_graphfilter();
            }
        }
    }


    @Output() updateQuerySearchEvent = new EventEmitter<any>();



    ngOnInit() {

        //First Load
        this.componentLocalInit = true;
    }



    getFilterTokens(queryString) {
        var query = { "analyzer": "spanishk", "text": queryString.replace('AND', '') }
        this._elasticService.getTokens(query, this.indexType).subscribe(result => {
            let tempResponse = result;

            let exclude = []

            for (let i = 0; i < tempResponse['tokens'].length; i++) {
                const element = tempResponse['tokens'][i];
                exclude.push(element.token)
            }

            this.jsonQueryXpackFilter.aggregations.significant_elements.significant_terms.exclude = exclude;

            this.getGraphFilterData();

        },
            error => {
                console.log(error);
            })
    }



    getGraphFilterData() {
        this._elasticService.getSearch(this.jsonQueryXpackFilter, this.indexType).subscribe(result => {
            let tempResponse = result;

            let listTermsResponse = tempResponse['aggregations']['significant_elements']['buckets'];
            this.desTokenizer(listTermsResponse);
        },
            error => {
                console.log(error);
            })
    }



    desTokenizer(listTermsResponse) {
        let listTermsClean = []
        let key = "";
        let message = "";
        let origin = "";
        let reach = 0;
        let doc_count = 0;
        let score = 0;
        let importance = 0;


        let isEmoji = false;
        let messageClean = "";
        let indexSubString = 0;
        let indexSubStringWithSpace = 0;

        let listTokenMessage = [];
        let tokenMessage = "";
        let tokenClean = "";
        let tokenHashtag = "";
        let tokenNoAccent = "";
        let regexSeachToken;

        for (let i = 0; i < listTermsResponse.length; i++) {
            const element = listTermsResponse[i];
            key = element['key'];
            message = element.details.hits.hits[0]._source.message;
            isEmoji = this.isEmoji(key);
            //Verif if is a valid TERM ***
            if (isEmoji || (!this.isInValidTerm(key) && !this.isKeyInLink(key, message))) {
                //Extract Basic Data ***
                origin = element.details.hits.hits[0]._source.origin;
                reach = element.reach.value;
                doc_count = element.doc_count;
                score = element.score;

                // Is not an Emoji ***
                if (!isEmoji) {




                    //Extract index in original text with key value *****
                    messageClean = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

                    //Verif key appears as an entire word and not as part of another word
                    indexSubString = messageClean.search(key);
                    indexSubStringWithSpace = messageClean.search(" " + key);
                    if (indexSubString != indexSubStringWithSpace && indexSubStringWithSpace != -1) {
                        indexSubString = indexSubStringWithSpace + 1;
                    }


                    if (indexSubString != -1) {//Extract Token from original text 
                        listTokenMessage = message.substring(indexSubString).split(" ")[0].split(/[\s\/"'´?!\/@#$%^&\(\)\[\]=\+\-\*_:;>< ]+/).join('-').split(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g).join('-').split('-');
                        tokenMessage = listTokenMessage[0];

                        //Verif if token form original text starts with an numeric value
                        if (!this.isNumeric(tokenMessage.charAt(0))) {
                            listTokenMessage = tokenMessage.split(/[\s.,]+/)
                            tokenMessage = listTokenMessage[0];

                        } else {
                            //Verif if the value before the number corresponse to a special char
                            tokenMessage = this.checkNumericValues(message, tokenMessage, indexSubString);
                            if (tokenMessage == "") // it is a number with the following structure number+char+number , they are not good terms
                                continue;
                            else {
                                if(tokenMessage.length <= 15){
                                    if(!this.isNumeric(tokenMessage.charAt(tokenMessage.length-1)))
                                        tokenMessage = tokenMessage.slice(0, -1);
                                }else{
                                    continue;
                                }
                            }
                        }

                    }
                    else { // The token does not exist explicitly on the message text
                        tokenMessage = key;
                    }

                    //Verif if token is an stopword
                    tokenNoAccent = tokenMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

                    if (!this.isStopWord(tokenNoAccent)) {

                        //Verif if token has a Hashtag *****
                        tokenHashtag = this.checkHashtag(message, tokenMessage, indexSubString)

                        if (tokenHashtag === tokenMessage) {

                            //Verif if is an Entity ***
                            if (tokenMessage.length <= 4 && tokenMessage.toUpperCase() === tokenMessage) {
                                // Keep UpperCase
                                tokenClean = tokenMessage;
                            } else {
                                //Capitalize
                                tokenClean = tokenMessage.charAt(0).toUpperCase() + tokenMessage.slice(1).toLowerCase();

                            }
                        } else {
                            //The token has a hashtag
                            tokenClean = tokenHashtag;


                        }

                    } else {
                        //continue with next index for
                        continue;
                    }

                } else {
                    tokenClean = key;
                }

                if (this.indexType == 'comments') {
                    importance = (0.3 * reach + 0.7 * doc_count) * score;
                } else {
                    importance = (0.7 * reach + 0.3 * doc_count) * score;
                }

                //add new element
                listTermsClean.push({ "token": tokenClean, 'importance': importance, "reach": reach, "doc_count": doc_count, "state": 0, "origin": origin, "sample": message });


            }
        }
        //Sort Array
        listTermsClean.sort(this.sortByProperty("importance"));



        //Remove Duplicates
        //listTermsClean = listTermsClean.filter((arr, index, self) =>
        //    index === self.findIndex((t) => (t.token === arr.token)));


        //Set Array to caoursel
        this.listTermsSearch = this.listTermsSearch.concat(listTermsClean.slice(0, 35));


        this.updateCarousel();
    }



    //Change State Term
    changeStateTerm(index, event: any) {
   

        //prevent grab carousel event  as click
      if(!event.defaultPrevented) {
  
  
              let state = this.listTermsSearch[index].state;
              if (state == 0)
                  this.listTermsSearch[index].state = 1;
              else
                  this.listTermsSearch[index].state = 0;
  
  
              //generate query string
              if (state == false) {
                  // term does not exist on listTermsSelectedSearch, so it need to be added
                  this.listTermsSelectedSearch.push(this.listTermsSearch[index]);
                  this.newQueryString += " AND " + this.listTermsSearch[index].token;
              }
              else {
                  //term must to be removed
                  this.listTermsSelectedSearch = this.removeElement(this.listTermsSelectedSearch, this.listTermsSearch[index].token);
                  this.newQueryString = this.newQueryString.replace(' AND ' + this.listTermsSearch[index].token, '');
              }
  
  
  
              // Update Query Search 
              this.lastQueryString = this.newQueryString;
              this.updateQuerySearchEvent.emit(this.newQueryString);
          }
    }

    /* Clear List */
    clearSelectedTermsList() {
        for (let index = 0; index < this.listTermsSelectedSearch.length; index++) {
            this.newQueryString = this.newQueryString.replace(' AND ' + this.listTermsSelectedSearch[index].token, '');
        }

        this.listTermsSelectedSearch = [];

        this.lastQueryString = this.newQueryString;
        this.updateQuerySearchEvent.emit(this.newQueryString);
    }

    /*update Carousel */

    updateCarousel() {


        setTimeout(() => {
            CarrouselRendering.init_graphfilter();

            this.listTermsSectionBlock = false;
            this.componentLocalLoading = false;

            if (window.screen.width > 992)
                CarrouselRendering.desktop_graphfilter();
            else
                CarrouselRendering.mobile_graphfilter();
        }, 1000);
    }



    onResize() {
        this.screenWidth = window.screen.width;
        if (window.screen.width > 992)
            CarrouselRendering.desktop_graphfilter();
        else
            CarrouselRendering.mobile_graphfilter();


    }


    /* Control */
    checkHashtag(message, token, indexSubString) {
        let tokenResult = token;
        //Verif if Token is an #Hashtag
        if (indexSubString >= 1) {
            if (message.charAt(indexSubString - 1) == '#')
                tokenResult = "#" + token;
        }
        return tokenResult;
    }

    checkNumericValues(message, token, indexSubString) {
        let tokenResult = token;
        //Verif if lasts chars are number

        if (message.charAt(indexSubString - 1) !== ' ') {


            if ((indexSubString >= 2 && !this.isNumeric(message.charAt(indexSubString - 2))) || indexSubString == 1) {

                tokenResult = message.charAt(indexSubString - 1) + token;
            } else {

                tokenResult = "";
            }
        } else {
            if (indexSubString >= 2 && this.isNumeric(message.charAt(indexSubString - 2))) {
                tokenResult = "";
            }

        }
        return tokenResult;
    }


    isInValidTerm(key) {
        let isNotAlphaNumeric = true;

        if (this.indexType == 'comments') // Alfa numeric only applies to comments
            isNotAlphaNumeric = (this.isNumeric(key) || this.isText(key))


        if (key.length <= 2 || key.includes('.') || key.includes('@') || !(isNotAlphaNumeric))
            return true;
        else
            return false;
    }
    isStopWord(key) {
        //verif if key is an stopword
        if (this.stopWordsListCustom.includes(key) || this.stopWordsListSpanish.includes(key) || key.includes('http'))
            return true;
        else
            return false;
    }


    isEmoji(key) {

        if (key.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g)) {
            return true;
        } else {
            return false;
        }
    }

    isKeyInLink(key, message) {
        let indexSubString = 0;
        let link = "";
        let response = false;
        indexSubString = message.search('http');

        if (indexSubString != -1) {
            link = message.substring(indexSubString).split(" ")[0].toLowerCase();
            response = link.includes(key);

        }
        return response;
    }

    isNumeric(str) {
        var pattern = /^[0-9]\d{0,2}(\.?\d{3})*(,\d+)?$/;
        return pattern.test(str);
    }

    isText(str) {
        var pattern = /[^a-zA-Z]/;
        return !pattern.test(str);
    }

    /* JSON  */

    //Sort JSON
    sortByProperty(property) {
        return function (a, b) {
            if (a[property] < b[property])
                return 1;
            else if (a[property] > b[property])
                return -1;

            return 0;
        }
    }
    removeElement(jsonList, token) {
        let newList = [];
        for (let index = 0; index < jsonList.length; index++) {
            const element = jsonList[index];
            if (element.token != token) {
                newList.push(element)
            }
        }
        return newList;
    }



}
