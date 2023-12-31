﻿using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;

namespace Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IGenericRepository<Order> _orderRepo;
    private readonly IGenericRepository<DeliveryMethod> _dmRepo;
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IBasketRepository _basketRepo;

    public OrderService(IGenericRepository<Order> orderRepo, IGenericRepository<DeliveryMethod> dmRepo,
        IGenericRepository<Product> productRepo, IBasketRepository basketRepo)
    {
        _orderRepo = orderRepo;
        _dmRepo = dmRepo;
        _productRepo = productRepo;
        _basketRepo = basketRepo;
    }

    public async Task<Order> CreateOrderAsync(string buyerEmail, int deliveryMethodId, string basketId, Address shippingAddress)
    {
        // get basket from basket repo (item & quantity)
        var basket = await _basketRepo.GetBasketAsync(basketId);
        // get items from product repo
        var items = new List<OrderItem>();

        foreach (var item in basket.Items)
        {
            var productItem = await _productRepo.GetByIdAsync(item.Id);
            var itemOrdered = new ProductItemOrdered(productItem.Id, productItem.Name, productItem.PictureUrl);
            var orderItem = new OrderItem(itemOrdered, productItem.Price, item.Quantity);
            
            items.Add(orderItem);
        }
        // get delivery method
        var deliveryMethod = await _dmRepo.GetByIdAsync(deliveryMethodId);
        // calculate subtotal
        var subtotal = items.Sum(item => item.Price * item.Quantity);
        // create the order
        var order = new Order(items, buyerEmail, shippingAddress, deliveryMethod, subtotal);
        // TODO: save to db
        
        //return order
        return order;
    }

    public Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
    {
        throw new NotImplementedException();
    }

    public Task<Order> GetOrderByIdAsync(int id, string buyerEmail)
    {
        throw new NotImplementedException();
    }

    public Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodAsync()
    {
        throw new NotImplementedException();
    }
}