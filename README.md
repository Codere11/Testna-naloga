# Uscom Catalog (Angular)

Aplikacija za pregled in lokalno urejanje izdelkov z integracijo javnega API-ja [Fake Store API](https://fakestoreapi.com) in z dodatno funkcionalnostjo lokalnih komentarjev. Zgrajena je z Angular (standalone komponentami), Angular Material, RxJS in Reactive Forms.

## Funkcionalnosti
- Seznam izdelkov (slike, naziv, kategorija, cena, ocena)
  - Iskanje po nazivu/kategoriji, klient­ska paginacija in sortiranje (Material tabela + Paginator)
  - Stanja nalaganja (spinner) in napak (Material snackbar)
- Urejanje/dodajanje/brisanje izdelkov (lokalno)
  - Material dialog z reaktivnim obrazcem, validacije, snackbar obvestila
  - Lokalni ID-ji so negativni; spremembe ne gredo na zunanji API
- Podrobnosti izdelka
  - Kartica izdelka z osnovnimi podatki
  - Komentarji (lokalno): dodaj/uredi/izbriši, dialog z validacijo
- Lokalizacija UI
  - Besedilo v slovenščini, `LOCALE_ID=sl`, valute v EUR, prilagojen Material Paginator

## Tehnologije in arhitektura
- Angular 19 (standalone), Angular Material, RxJS/Signals
- Mapa `state/` vsebuje majhne stores (ProductsStore, CommentsStore)
- Mapa `features/` za zaslone/komponente (seznam, podrobnosti, dialogi)
- Mapa `core/services/` za HTTP storitve (Fake Store API)

## Zagon projekta (lokalno)
1) Namesti odvisnosti:
```bash
npm install
```
2) Zaženi razvojni strežnik:
```bash
npm start
```
Aplikacija bo na `http://localhost:4200/`. Ob spremembah se samodejno osveži.

## Gradnja (build)
```bash
npm run build
```
Artefakti so v mapi `dist/`. Privzeto se uporablja produkcijska optimizacija.

## Kakovost in najboljše prakse
- Reaktivni obrazci z jasno validacijo in onemogočenim gumbom “Shrani”, dokler obrazec ni veljaven
- Dosledna uporaba Angular Material (Toolbar, Table, Dialog, FormField/Input, Paginator, SnackBar, Icons)
- Ločitev odgovornosti: API servis ➜ store ➜ UI
- Enotna UX pravila: centered naslovi dialogov, konsistentni razmaki, jasna stanja (prazno/nalaganje/napaka)

## Omejitve
- Fake Store API omogoča samo branje. Vse spremembe (dodajanje, urejanje, brisanje) so **lokalne** in niso persistirane na API.
- (Po želji) je možno razširiti s shranjevanjem lokalnih sprememb v `localStorage`.

## Struktura projektnih map (izsek)
```
src/app
  ├─ core/
  │   └─ services/product.service.ts
  ├─ features/
  │   ├─ products/
  │   │   ├─ products-list.component.*
  │   │   ├─ product-dialog.component.*
  │   │   ├─ product-details.component.*
  │   └─ comments/
  │       └─ comment-dialog.component.*
  ├─ models/
  │   ├─ product.model.ts
  │   └─ comment.model.ts
  └─ state/
      ├─ products.store.ts
      └─ comments.store.ts
```

## Razvojni ukazi (Angular CLI)
- Ustvari komponento:
```bash
ng generate component my-component
```
- Pomoč in seznam shem:
```bash
ng generate --help
```

## Licenca
Projekt je namenjen tehnični nalogi/demonstraciji in se lahko prosto uporablja v ta namen.
