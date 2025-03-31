'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'Roles'



const roleSchema = new Schema({
    rol_name: { type: String, default: 'user', enum: ['user', 'shop', 'admin'] },
    rol_slug: { type: String, required: true }, /// 0001-a
    rol_status: { type: String, default: 'active', enum: ['active', 'block', 'pending'] },
    rol_description: { type: String, default: '' },
    rol_grants: [ // user nay truy cap voi quyen, action nao 
        {
            resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
            actions: [{ type: String, required: true }],
            attributes: { type: String, default: '*' }
        }

        /*
        "rol_grants": [
        {
          "resource": "67890", // ID của tài nguyên "Products"
          "actions": ["read", "write", "delete"],
          "attributes": "*, !amount" // tat ca tru amout 
        }
      ],
    
        */
    ]
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
})

module.exports = {
    cart: model(DOCUMENT_NAME, roleSchema)
}