# Integration La Poste

Le bouton admin `Generer un bordereau d'envoi` appelle:

`/api/admin/orders/[id]/shipping-label`

Si l'API La Poste est configuree, le site genere un vrai bordereau via l'API Barcode. Sinon, il continue de sortir le PDF interne Mini Gang.

## Variables Vercel

```env
ENABLE_LA_POSTE=true
LA_POSTE_CLIENT_ID=
LA_POSTE_CLIENT_SECRET=
LA_POSTE_FRANKING_LICENSE=
LA_POSTE_SCOPE=DCAPI_BARCODE_READ
LA_POSTE_TOKEN_URL=https://api.post.ch/OAuth/token
LA_POSTE_API_URL=https://dcapi.apis.post.ch/barcode/v1/generateAddressLabel
LA_POSTE_SERVICE_CODE=ECO
LA_POSTE_LABEL_LAYOUT=A6
LA_POSTE_LABEL_FILE_TYPE=PDF
LA_POSTE_PRINT_PREVIEW=true
LA_POSTE_DEFAULT_WEIGHT_GRAMS=1000

SHIPPING_SENDER_NAME=Mini Gang
SHIPPING_SENDER_LINE1=Chemin de la Cuvigne 47
SHIPPING_SENDER_POSTAL_CODE=1614
SHIPPING_SENDER_CITY=Granges
SHIPPING_SENDER_COUNTRY=CH
```

## Mise en production

- Garder `LA_POSTE_PRINT_PREVIEW=true` pour les premiers tests.
- Passer a `LA_POSTE_PRINT_PREVIEW=false` seulement quand La Poste et le client ont valide le format de l'etiquette.
- Verifier avec La Poste le bon `LA_POSTE_SERVICE_CODE` selon le contrat colis.
- Le numero de suivi retourne par La Poste est enregistre dans `shipments` quand il est fourni.
