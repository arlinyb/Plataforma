// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import 'zone.js/dist/zone-error';

export const environment = {
    production: false,
    firebase: {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: ""
    },
    facebook:{
        initParams :{
            appId: '',
            xfbml: true,
            autoLogAppEvents : true,
            version: 'v17.0'
          },
        accessToken: ""
        
    },
    httpOptionsElasticQuery: {
        ContentType: 'application/json',
        Authorization: '',
        UrlElastic:''
    },
    user:{
        uid:"",
        name:"",
        email:"",
        image:"",
        provider:"",
        phone:"",
        currentProfile:{
            current_l0:"",
            current_l1:"",
            current_l2: "",
            current_l3: "",
            current_index:"",
        }
    }
  

};
