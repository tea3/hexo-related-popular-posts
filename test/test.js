const assert = require('power-assert')
const pv = require('../lib/pv')

/*
before( (done) => {
    console.log('[describe]before test')
    done()
})

beforeEach( (done) => {
    console.log('[it]before every test')
    done()
})

afterEach( (done) => {
    console.log('[it]after every test')
    done()
})

after( (done) => {
    console.log('[describe]after test')
    done()
})
*/

const post = {'path': '/test.html'}
const hexo_sample = {
    'config': {
        'popularPosts': {
            'tmp': {
                'gaData': [
                    {
                        'path': '/test.html',
                        'pvMeasurementsStartDate': 30,
                        'totalPV': 70,
                        'pv': 10,
                    },
                ],
            },
        },
    },
}


describe('sample test', () => {
    describe('1. pv.js test', () => {
        it('PV is 70', () => {
            assert.equal(pv(post, hexo_sample), '70')
        })
    })
})
