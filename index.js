const addressCodec = require('ripple-address-codec')
const request = require('request-promise')

const RIPPLE_EPOCH = 946684800

const VALIDATOR_LIST_URI = process.env.VALIDATOR_LIST_URI || 'https://vl.ripple.com'

function toBytes(hex) {
  return new Buffer(hex, 'hex').toJSON().data;
}

function hextoBase58 (hex) {
  return addressCodec.encodeNodePublic(toBytes(hex))
}

function parseExpiration(expiration) {
  return new Date((expiration+RIPPLE_EPOCH)*1000)
}

async function getValidatorList(uri) {
  const data = await request.get({
    url: uri,
    json: true
  })

  const buff = new Buffer(data.blob, 'base64');
  const valList = JSON.parse(buff.toString('ascii'))

  for (const validator of valList.validators) {
    const valKey = hextoBase58(validator.validation_public_key)
    const valData = await request.get({
      url: 'https://data.ripple.com/v2/network/validators/' + valKey,
      json: true
    })

    console.log(valKey, valData.domain)
  }

  console.log('\nExpiration:', parseExpiration(valList['expiration']))
  console.log('\nSequence:', valList['sequence'])
}

try {
  getValidatorList(VALIDATOR_LIST_URI)
} catch (err) {
  console.log(err)
  process.exit(1)
}
