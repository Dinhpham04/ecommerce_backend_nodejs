
// const reasonPhraseCode = {
//     '100': 'Continue',
//     '101': 'Switching Protocols',
//     '200': 'OK',
//     '201': 'Created',
//     '202': 'Accepted',
//     '203': 'Non-Authoritative Information',
//     '204': 'No Content',
//     'default': 'No Code'
// }

// const returnReasonPhraseCode = code => {
//     console.log(reasonPhraseCode[code] || reasonPhraseCode['default'])
// }

const reasonPhraseCode = new Map([
    [100, 'Continue'],
    [101, 'Switching Protocols'],
    [200, 'OK'],
    [201, 'Created'],
    [202, 'Accepted'],
    [203, 'Non-Authoritative Information'],
    [204, 'No Content'],
    ['default', 'No Code']
])

const returnReasonPhraseCode = code => {
    console.log(reasonPhraseCode.get(code) || reasonPhraseCode.get('default'));
}
returnReasonPhraseCode(201);