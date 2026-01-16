import { BasePage } from '../base.page';

export class ProductDetailsPage extends BasePage {
  protected pageUrl = 'https://www.automationexercise.com/products';
  protected urlPattern = 'https://www.automationexercise.com/product_details/{id}';
}
