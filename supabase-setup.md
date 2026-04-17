# Supabase Setup Instructions

## Create Storage Bucket for Property Images

To enable image uploads for properties, you need to create a public storage bucket in your Supabase project.

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project.
3. In the left sidebar, click on **Storage**.
4. Click the **New bucket** button.
5. Name the bucket exactly: `property-images`
6. Toggle the **Public bucket** option to make it public.
7. Click **Save**.

## Configure Storage Policies

To allow agents to upload images, you need to set up a storage policy.

1. In the Storage section, click on **Policies** in the left sidebar.
2. Under the `property-images` bucket, click **New policy**.
3. Choose **For full customization**.
4. Name the policy (e.g., "Allow authenticated uploads").
5. Select **INSERT** for the Allowed operations.
6. For the Target roles, select **authenticated**.
7. Click **Review** and then **Save policy**.

*(Optional)* If you want users to be able to delete their own images, create another policy for **DELETE** operations with the same authenticated role.

Now your application is ready to handle property image uploads!
