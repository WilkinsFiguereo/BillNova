{
    'name': 'BillNova',
    'version': '1.0.0',
    'summary': 'Modulo base BillNova',
    'description': 'Estructura inicial del modulo BillNova.',
    'author': 'Wilkins',
    'category': 'Tools',
    'license': 'LGPL-3',
    'depends': ['base', 'point_of_sale', 'sale', 'account', 'mail', 'rating', 'product'],
    'data': [
        'security/ir.model.access.csv',
        'views/users_views.xml',
        'views/company_views.xml',
        'views/report_views.xml',
    ],
    'installable': True,
    'application': True,
}
