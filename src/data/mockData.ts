import { Transaction, Category, TransactionType } from '@/types/finance';

const categories: Category[] = ['Salary', 'Freelance', 'Investment', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateMockTransactions(count = 50): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  for (let i = 0; i < count; i++) {
    const type: TransactionType = Math.random() > 0.35 ? 'expense' : 'income';
    const incomeCategories: Category[] = ['Salary', 'Freelance', 'Investment'];
    const expenseCategories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];
    const category = type === 'income'
      ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
      : expenseCategories[Math.floor(Math.random() * expenseCategories.length)];

    const amountMap: Record<string, [number, number]> = {
      Salary: [3000, 6000], Freelance: [500, 3000], Investment: [100, 2000],
      Food: [10, 150], Transport: [5, 80], Shopping: [20, 500],
      Entertainment: [10, 200], Bills: [50, 300], Health: [20, 400],
      Education: [50, 500], Travel: [100, 2000], Other: [10, 300],
    };
    const [min, max] = amountMap[category];
    const amount = Math.round((min + Math.random() * (max - min)) * 100) / 100;

    const descriptions: Record<string, string[]> = {
      Salary: ['Monthly salary', 'Bonus payment'],
      Freelance: ['Web design project', 'Consulting fee', 'Logo design'],
      Investment: ['Stock dividends', 'Crypto gains', 'Bond interest'],
      Food: ['Grocery store', 'Restaurant dinner', 'Coffee shop', 'Lunch'],
      Transport: ['Gas station', 'Uber ride', 'Bus pass', 'Parking'],
      Shopping: ['Online order', 'Clothing store', 'Electronics', 'Home decor'],
      Entertainment: ['Movie tickets', 'Concert', 'Streaming subscription', 'Books'],
      Bills: ['Electricity bill', 'Internet bill', 'Phone bill', 'Water bill'],
      Health: ['Pharmacy', 'Gym membership', 'Doctor visit'],
      Education: ['Online course', 'Books', 'Workshop'],
      Travel: ['Flight tickets', 'Hotel booking', 'Car rental'],
      Other: ['Miscellaneous', 'Gift', 'Donation'],
    };
    const descList = descriptions[category];
    const description = descList[Math.floor(Math.random() * descList.length)];

    transactions.push({
      id: generateId(),
      date: randomDate(sixMonthsAgo, now),
      amount,
      category,
      type,
      description,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
