import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Basket, BasketItem, BasketTotal } from '../shared/models/basket';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Product } from '../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<Basket | null>(null);
  basketSource$ = this.basketSource.asObservable();
  private basketTotalSource = new BehaviorSubject<BasketTotal | null>(null);
  basketTotalSource$ = this.basketTotalSource.asObservable();

  constructor(private http: HttpClient) {}
  getBasket(id: string) {
    return this.http.get<Basket>(this.baseUrl + 'basket?id=' + id).subscribe({
      next: (basket) => {
        this.basketSource.next(basket);
        this.calculateTotal();
      },
    });
  }

  setBasket(basket: Basket) {
    return this.http.post<Basket>(this.baseUrl + 'basket', basket).subscribe({
      next: (basket) => {
        this.basketSource.next(basket);
        this.calculateTotal();
      },
    });
  }

  getCurrentBasketValue() {
    return this.basketSource.value;
  }

  addItemToBasket(item: Product, quantity = 1) {
    const itemToAdd = this.mapProductItemToBasketItem(item);
    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    this.setBasket(basket);
  }

  private addOrUpdateItem(
    items: BasketItem[],
    itemToAdd: BasketItem,
    quantity: number
  ): BasketItem[] {
    const item = items.find((x) => x.id === itemToAdd.id);
    if (item) item.quantity += quantity;
    else {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    }
    return items;
  }

  private createBasket(): Basket {
    const basket = new Basket();

    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  private mapProductItemToBasketItem(item: Product): BasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.productBrand,
      type: item.productType,
    };
  }

  private calculateTotal() {
    const basket = this.getCurrentBasketValue();
    if (!basket) return;

    const shipping = 0;
    const subtotal = basket.items.reduce((a, b) => b.price * b.quantity + a, 0);
    const total = subtotal + shipping;

    this.basketTotalSource.next({
      shipping,
      total,
      subtotal,
    });
  }
}