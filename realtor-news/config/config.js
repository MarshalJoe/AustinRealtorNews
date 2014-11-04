module.exports = {
	development: {
		db: 'mongodb://localhost/news',
		app: {
			name: 'Austin Realtor News'
		},
	},
  	production: {
    	db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL,
		app: {
			name: 'Austin Realtor News'
		},
 	}
}
