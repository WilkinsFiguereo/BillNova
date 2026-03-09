from odoo import http
from odoo.http import request
import json


class ProductReviewController(http.Controller):

    @http.route('/api/products/<int:product_id>/review', type='http', auth='user', methods=['POST'], csrf=False)
    def create_review(self, product_id):

        data = json.loads(request.httprequest.data)

        c
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        omment = data.get('comment')
        rating_value = float(data.get('rating', 0))

        if rating_value < 0 or rating_value > 5:
            return request.make_json_response({
                "error": "Rating must be between 0 and 5"
            }, status=400)

        user = request.env.user

        # comentario
        request.env['mail.message'].sudo().create({
            'model': 'product.product',
            'res_id': product_id,
            'body': comment,
            'message_type': 'comment',
            'author_id': user.partner_id.id
        })

        # rating
        request.env['rating.rating'].sudo().create({
            'res_model': 'product.product',
            'res_id': product_id,
            'partner_id': user.partner_id.id,
            'rating': rating_value
        })

        return request.make_json_response({
            "success": True
        })