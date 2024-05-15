use anchor_lang::prelude::*;

declare_id!("2F7ca2hWyYmxjNnRE26nFNw3QoUr3iuaghdGWzuYQevr");

#[program]
pub mod phanuel {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
